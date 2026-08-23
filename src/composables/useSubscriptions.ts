import { computed, ref, shallowRef } from 'vue'
import {
  fetchAllSubscriptions,
  fetchChannelCreatedAt,
  type FetchProgress,
} from '@/lib/youtube'
import { buildStats } from '@/lib/stats'
import { AppError, isAppError, type AppErrorKind } from '@/lib/errors'
import { filterByQuery, normalizeForSearch } from '@/lib/search'
import { elapsedYears } from '@/lib/format'
import { sortChannels, type SortOrder } from '@/lib/sort'
import type { SubscribedChannel } from '@/types/youtube'

export type { SortOrder }

/** 書き出し画像に載せるチャンネルの件数 */
export const SHARE_LIMIT = 5

/**
 * 書き出し画像の並び。
 * 一覧の並べ替えと同じ 4 種に、手で選ぶ custom を足したもの。
 * 一覧の並べ替え(sortOrder)とは連動させない。画像に載せたい 5 件と、
 * 画面で眺めたい並びは別物なので、片方を触ったらもう片方も変わると困る。
 */
export type ShareOrder = SortOrder | 'custom'

/** 画像の一覧に添える見出し */
export const SHARE_ORDER_HEADING: Record<ShareOrder, string> = {
  oldest: '登録が古い順',
  newest: '登録が新しい順',
  sinceOpenShort: '開設からすぐ登録した順',
  sinceOpenLong: '開設から長く経って登録した順',
  custom: 'えらんだチャンネル',
}

export type RangeMode = 'lte' | 'gte' | 'range'

/**
 * 1 つの軸(登録年 / 登録期間)の絞り込み条件。
 * 値が未選択(null)のうちは条件として成立していない、と扱う。
 */
export interface AxisFilter {
  mode: RangeMode
  a: number | null
  b: number | null
}

export function defaultAxisFilter(): AxisFilter {
  return { mode: 'gte', a: null, b: null }
}

/**
 * 値が条件に合うか。
 * 条件が成立していないときは null を返し、判定そのものに参加させない
 * (false を返すと OR が常に落ちてしまうため)。
 *
 * range は片側だけの指定も許す。プルダウン 2 つの UI では
 * 「始点だけ選んだ」状態が自然に起きるため。
 */
export function axisHit(f: AxisFilter | null, v: number): boolean | null {
  if (!f) return null
  if (f.mode === 'lte') return f.a === null ? null : v <= f.a
  if (f.mode === 'gte') return f.a === null ? null : v >= f.a

  if (f.a === null && f.b === null) return null
  if (f.b === null) return v >= f.a!
  if (f.a === null) return v <= f.b
  return v >= Math.min(f.a, f.b) && v <= Math.max(f.a, f.b)
}

/** すべてメモリ上のみ。永続化しない。 */
const channels = shallowRef<SubscribedChannel[]>([])
const status = ref<'idle' | 'loading' | 'ready' | 'error'>('idle')
const errorKind = ref<AppErrorKind | null>(null)
const progress = ref<FetchProgress>({ loaded: 0, total: null, truncated: false })
const truncated = ref(false)
const sortOrder = ref<SortOrder>('oldest')
const shareOrder = ref<ShareOrder>('oldest')
/** 自由選択で選んだ channelId。押した順に持ち、画像もその順で並べる */
const pickedIds = ref<string[]>([])
/** 一覧に選択ボタンを出しているか(自由選択モード) */
const picking = ref(false)
const keyword = ref('')
const yearFilter = ref<AxisFilter>(defaultAxisFilter())
const spanFilter = ref<AxisFilter>(defaultAxisFilter())
/** 開設日の後追い取得が進行中か */
const enriching = ref(false)

export function useSubscriptions() {
  const stats = computed(() => buildStats(channels.value))

  /**
   * 正規化済みのタイトル。channels が差し替わったときだけ作り直すので、
   * 1 打鍵ごとに全件を正規化し直すことはない。
   */
  const searchIndex = computed(() => channels.value.map((c) => normalizeForSearch(c.title)))

  const hasDateFilter = computed(
    () =>
      axisHit(yearFilter.value, 0) !== null || axisHit(spanFilter.value, 0) !== null,
  )

  /**
   * 登録年と登録期間で先に絞る。2 軸は OR で合流させる
   * (どちらか一方でも当てはまれば残す)。
   * searchIndex は channels と同じ添字なので items と keys を対で取り出す。
   */
  const dateFiltered = computed(() => {
    if (!hasDateFilter.value) return { items: channels.value, keys: searchIndex.value }

    const items: SubscribedChannel[] = []
    const keys: string[] = []
    channels.value.forEach((c, i) => {
      const y = axisHit(yearFilter.value, c.subscribedAt.getFullYear())
      const s = axisHit(spanFilter.value, elapsedYears(c.subscribedAt))
      // null(未設定)の軸は判定に参加させない
      if (y === true || s === true) {
        items.push(c)
        keys.push(searchIndex.value[i] ?? '')
      }
    })
    return { items, keys }
  })

  const filtered = computed(() =>
    filterByQuery(dateFiltered.value.items, dateFiltered.value.keys, keyword.value),
  )

  /** 部分一致が 0 件で、曖昧一致にフォールバックしたか */
  const isFuzzyMatch = computed(() => filtered.value.fuzzy)

  const visibleChannels = computed(() =>
    sortChannels(filtered.value.items, sortOrder.value),
  )

  /** 自由選択で選んだチャンネル。選んだ順のまま、消えた ID は落とす */
  const pickedChannels = computed(() => {
    const byId = new Map(channels.value.map((c) => [c.channelId, c]))
    return pickedIds.value
      .map((id) => byId.get(id))
      .filter((c): c is SubscribedChannel => c !== undefined)
  })

  /** 書き出し画像に載せる 5 件。一覧の並び順・絞り込みとは独立させる */
  const shareList = computed(() =>
    shareOrder.value === 'custom'
      ? pickedChannels.value.slice(0, SHARE_LIMIT)
      : sortChannels(channels.value, shareOrder.value).slice(0, SHARE_LIMIT),
  )

  const shareHeading = computed(() => SHARE_ORDER_HEADING[shareOrder.value])

  function isPicked(channelId: string): boolean {
    return pickedIds.value.includes(channelId)
  }

  /**
   * 自由選択の出し入れ。
   * 選んだ時点で画像の並びを custom に寄せる。選ぶ操作は画像に載せるための
   * ものなので、選んだのに画像が変わらない状態を作らない。
   * 空になったら既定の並びへ戻す(空の一覧を書き出させないため)。
   */
  function togglePick(channelId: string) {
    if (isPicked(channelId)) {
      pickedIds.value = pickedIds.value.filter((id) => id !== channelId)
      if (pickedIds.value.length === 0 && shareOrder.value === 'custom') {
        shareOrder.value = 'oldest'
      }
      return
    }
    if (pickedIds.value.length >= SHARE_LIMIT) return
    pickedIds.value = [...pickedIds.value, channelId]
    shareOrder.value = 'custom'
  }

  function clearPicks() {
    pickedIds.value = []
    if (shareOrder.value === 'custom') shareOrder.value = 'oldest'
  }

  async function load(accessToken: string) {
    status.value = 'loading'
    errorKind.value = null
    progress.value = { loaded: 0, total: null, truncated: false }
    try {
      const res = await fetchAllSubscriptions(accessToken, (p) => {
        progress.value = p
      })
      channels.value = res.channels
      truncated.value = res.truncated
      status.value = 'ready'
      // 開設日は後追いで埋める。取得に失敗しても一覧は壊さない
      void enrichCreatedAt(accessToken)
    } catch (e) {
      const err: AppError = isAppError(e) ? e : new AppError('unknown', String(e))
      errorKind.value = err.kind
      status.value = 'error'
      throw err
    }
  }

  /**
   * チャンネル開設日を後追いで埋める。
   * 一覧はすでに表示済みなので、ここで失敗しても握り潰して構わない
   * (開設日が出ないだけで、登録日の一覧は成立する)。
   *
   * 登録が古い順に問い合わせる。画面の初期表示も「最初の登録」も
   * そこなので、先に返ってきた分から順に埋まって見える。
   */
  async function enrichCreatedAt(accessToken: string) {
    enriching.value = true
    try {
      const ids = [...channels.value]
        .sort((a, b) => a.subscribedAt.getTime() - b.subscribedAt.getTime())
        .map((c) => c.channelId)

      // 全件そろうのを待たず、返ってきたチャンクごとに一覧へ流し込む
      await fetchChannelCreatedAt(accessToken, ids, (partial) => {
        channels.value = channels.value.map((c) => {
          const at = partial.get(c.channelId)
          return at ? { ...c, channelCreatedAt: at } : c
        })
      })
    } catch (e) {
      if (import.meta.env.DEV) console.warn('[channels] 開設日の取得に失敗しました', e)
    } finally {
      enriching.value = false
    }
  }

  /**
   * 開発用。渡されたダミーデータを、実際の取得と同じように
   * 1 ページ 50 件ずつ進捗を出しながら読み込む。
   */
  async function loadMock(all: SubscribedChannel[], pageDelayMs = 260) {
    status.value = 'loading'
    errorKind.value = null
    progress.value = { loaded: 0, total: all.length, truncated: false }

    for (let loaded = 0; loaded < all.length; loaded += 50) {
      await new Promise((r) => setTimeout(r, pageDelayMs))
      progress.value = {
        loaded: Math.min(loaded + 50, all.length),
        total: all.length,
        truncated: false,
      }
    }

    channels.value = all
    truncated.value = false
    status.value = 'ready'
  }

  function reset() {
    channels.value = []
    status.value = 'idle'
    errorKind.value = null
    truncated.value = false
    keyword.value = ''
    sortOrder.value = 'oldest'
    yearFilter.value = defaultAxisFilter()
    spanFilter.value = defaultAxisFilter()
    shareOrder.value = 'oldest'
    pickedIds.value = []
    picking.value = false
  }

  return {
    channels,
    visibleChannels,
    isFuzzyMatch,
    stats,
    status,
    errorKind,
    progress,
    truncated,
    enriching,
    sortOrder,
    keyword,
    yearFilter,
    spanFilter,
    hasDateFilter,
    shareOrder,
    shareList,
    shareHeading,
    pickedIds,
    pickedChannels,
    picking,
    isPicked,
    togglePick,
    clearPicks,
    load,
    loadMock,
    reset,
  }
}
