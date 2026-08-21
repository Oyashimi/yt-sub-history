import { computed, ref, shallowRef } from 'vue'
import { fetchAllSubscriptions, type FetchProgress } from '@/lib/youtube'
import { buildStats } from '@/lib/stats'
import { AppError, isAppError, type AppErrorKind } from '@/lib/errors'
import type { SubscribedChannel } from '@/types/youtube'

export type SortOrder = 'oldest' | 'newest'

/** すべてメモリ上のみ。永続化しない。 */
const channels = shallowRef<SubscribedChannel[]>([])
const status = ref<'idle' | 'loading' | 'ready' | 'error'>('idle')
const errorKind = ref<AppErrorKind | null>(null)
const progress = ref<FetchProgress>({ loaded: 0, total: null, truncated: false })
const truncated = ref(false)
const sortOrder = ref<SortOrder>('oldest')
const keyword = ref('')

export function useSubscriptions() {
  const stats = computed(() => buildStats(channels.value))

  const visibleChannels = computed(() => {
    const q = keyword.value.trim().toLowerCase()
    const list = q
      ? channels.value.filter((c) => c.title.toLowerCase().includes(q))
      : [...channels.value]
    list.sort((a, b) =>
      sortOrder.value === 'oldest'
        ? a.subscribedAt.getTime() - b.subscribedAt.getTime()
        : b.subscribedAt.getTime() - a.subscribedAt.getTime(),
    )
    return list
  })

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
    } catch (e) {
      const err: AppError = isAppError(e) ? e : new AppError('unknown', String(e))
      errorKind.value = err.kind
      status.value = 'error'
      throw err
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
  }

  return {
    channels,
    visibleChannels,
    stats,
    status,
    errorKind,
    progress,
    truncated,
    sortOrder,
    keyword,
    load,
    loadMock,
    reset,
  }
}
