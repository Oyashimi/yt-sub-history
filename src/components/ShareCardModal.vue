<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import { toPng } from 'html-to-image'
import ShareCard from './ShareCard.vue'
import { toDataUrl } from '@/lib/image'
import { SHARE_LIMIT, type ShareOrder } from '@/composables/useSubscriptions'
import type { Stats } from '@/lib/stats'
import type { SubscribedChannel } from '@/types/youtube'

const props = defineProps<{
  stats: Stats
  /** カードに載せるチャンネル。並び順は呼び出し側で決める */
  list: SubscribedChannel[]
  listLabel?: string
  /** 画像の並び。ここで切り替えた結果は呼び出し側に返す */
  order: ShareOrder
  /** 一覧で選ばれている件数。0 なら自由選択はまだ使えない */
  pickedCount: number
}>()
const emit = defineEmits<{
  close: []
  'update:order': [ShareOrder]
  /** まだ 1 件も選んでいない状態で自由選択を押したとき。一覧で選ばせる */
  pick: []
}>()

const frameRef = useTemplateRef<HTMLElement>('frame')
/** プレビューに使える領域。ここの幅を基準に縮小率を決める */
const areaRef = useTemplateRef<HTMLElement>('area')
/** ボタン群。プレビューはこの高さを避けて収める */
const controlsRef = useTemplateRef<HTMLElement>('controls')
const rootRef = useTemplateRef<HTMLElement>('root')
const avatars = ref<Record<string, string>>({})
/** data URL 化を試した channelId。失敗したものを毎回引き直さないための控え */
const triedAvatars = new Set<string>()
/** 書き出し済み PNG の data URL。長押し保存できるよう、これをプレビューに出す */
const pngUrl = ref<string | null>(null)
const generating = ref(false)
const sharing = ref(false)
const message = ref<string | null>(null)
/** 書き出し失敗の原因。開発中だけ画面に出す */
const lastError = ref<string | null>(null)

const IMAGE_OPTIONS = { pixelRatio: 3, cacheBust: true, skipFonts: true } as const
const FILE_NAME = 'subscribed-since.png'

/** 暗いオーバーレイの上に置くので、影は結果画面と違って紙の色で落とす */
const BUTTON_BASE =
  'rounded-full border-2 border-fg bg-surface font-round transition-[transform,box-shadow] disabled:text-fg-faint'
/** ここに来た人の目的なので、影も含めて一段大きく取る */
const BUTTON_MAIN = `${BUTTON_BASE} px-8 py-4 text-[16px] font-bold shadow-[5px_5px_0_var(--color-base)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_var(--color-base)] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none`
const BUTTON_SUB = `${BUTTON_BASE} px-4 py-2.5 text-[12px] font-medium shadow-[3px_3px_0_var(--color-base)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_var(--color-base)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none`

/**
 * 画像に載せる並び。一覧の並べ替えと同じ組み方にして、
 * 「一覧でできることが画像でもできる」と見て分かるようにする。
 */
const ORDER_GROUPS: Array<{
  axis: string
  options: Array<{ value: ShareOrder; label: string }>
}> = [
  {
    axis: '登録日',
    options: [
      { value: 'oldest', label: '古い順' },
      { value: 'newest', label: '新しい順' },
    ],
  },
  {
    axis: '開設から',
    options: [
      { value: 'sinceOpenShort', label: '短い順' },
      { value: 'sinceOpenLong', label: '長い順' },
    ],
  },
]

/** 選択中は塗り、それ以外は薄い字。結果画面の並べ替えと同じ扱い */
function pillClass(active: boolean): string {
  return active
    ? 'bg-fg/15 font-bold text-fg'
    : 'text-fg-faint hover:bg-line/60 hover:text-fg-dim'
}

/**
 * 自由選択。まだ 1 件も選んでいないときは切り替えても空の画像になるので、
 * モードを変えるのではなく一覧で選んでもらうところへ送る。
 */
function chooseCustom() {
  if (props.pickedCount === 0) {
    emit('pick')
    return
  }
  emit('update:order', 'custom')
}

/**
 * 書き出し対象のカード要素。ShareCard の $el は当てにならないので
 * data 属性を目印に DOM から引く。
 */
function cardEl(): HTMLElement | null {
  return frameRef.value?.querySelector<HTMLElement>('[data-share-card]') ?? null
}

/**
 * プレビューの縮小率。カードは書き出しのために 360×640 固定なので、
 * 画面に入らないぶんは transform で縮める。
 * transform はカードを包む要素に掛ける。カード自身に掛けると書き出しに影響する。
 */
const scale = ref(1)
/** ShareCard の w-90 / h-[640px] に合わせた初期値。マウント後に実測で上書きする */
const cardWidth = ref(360)
const cardHeight = ref(640)
/** 縮小してもレイアウト上の寸法は元のままなので、枠側で詰める */
const previewWidth = computed(() => `${Math.round(cardWidth.value * scale.value)}px`)
const previewHeight = computed(() => `${Math.round(cardHeight.value * scale.value)}px`)

/** 親の gap-6 ぶん。プレビューとボタン群の間隔 */
const GAP = 24

/**
 * 実際に見えている高さ。
 * iOS Safari の fixed 要素はツールバーが隠れた状態のレイアウトビューポート基準に
 * なるので、clientHeight だけを見ると上下のツールバーぶんはみ出す。
 * visualViewport はツールバー(とキーボード)を除いた高さを返すので、小さい方を採る。
 */
function visibleHeight(root: HTMLElement): number {
  const visual = window.visualViewport?.height
  return Math.min(root.clientHeight, visual ?? window.innerHeight)
}

function fit() {
  const area = areaRef.value
  const node = cardEl()
  if (!area || !node) return

  // offsetWidth/offsetHeight は transform の影響を受けないので縮小中でも元の寸法が取れる
  cardWidth.value = node.offsetWidth
  cardHeight.value = node.offsetHeight

  const byWidth = area.clientWidth / node.offsetWidth

  // ボタン群が画面外に出ないよう、残り高さにも収める
  let byHeight = Infinity
  const root = rootRef.value
  const controls = controlsRef.value
  if (root && controls) {
    const style = getComputedStyle(root)
    const padding = (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0)
    const room = visibleHeight(root) - padding - GAP - controls.offsetHeight
    byHeight = room / node.offsetHeight
  }

  scale.value = Math.max(0.3, Math.min(1, byWidth, byHeight))
}

let observer: ResizeObserver | null = null

onMounted(() => {
  fit()
  // ツールバーの出入りは ResizeObserver に出ないので、visualViewport 側でも拾う
  window.visualViewport?.addEventListener('resize', fit)
  window.visualViewport?.addEventListener('scroll', fit)
  window.addEventListener('orientationchange', fit)

  if (typeof ResizeObserver === 'undefined') return
  observer = new ResizeObserver(fit)
  // 領域の幅と、メッセージ表示で伸縮するボタン群の高さの両方を見る
  for (const el of [areaRef.value, controlsRef.value, rootRef.value]) {
    if (el) observer.observe(el)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
  window.visualViewport?.removeEventListener('resize', fit)
  window.visualViewport?.removeEventListener('scroll', fit)
  window.removeEventListener('orientationchange', fit)
})

/** カードに出るサムネを data URL 化する。すでに試したものは引き直さない */
async function loadAvatars(list: SubscribedChannel[]) {
  const targets = list.filter((c) => !triedAvatars.has(c.channelId))
  if (targets.length === 0) return
  for (const c of targets) triedAvatars.add(c.channelId)

  const entries = await Promise.all(
    targets.map(async (c) => [c.channelId, await toDataUrl(c.thumbnailUrl)] as const),
  )
  avatars.value = {
    ...avatars.value,
    ...Object.fromEntries(
      entries.filter((e): e is readonly [string, string] => e[1] !== null),
    ),
  }
}

/**
 * 焼き直しの世代。並び順を続けて切り替えたときに、
 * 古い書き出しが後から届いてプレビューを巻き戻さないようにする。
 */
let renderToken = 0

/** サムネを揃えてから焼き直す。載せる中身が変わるたびに呼ぶ */
async function refresh() {
  const token = ++renderToken
  pngUrl.value = null
  message.value = null
  await loadAvatars(props.list)
  if (token !== renderToken) return
  // 差し替えたサムネと一覧が DOM に乗ってから書き出す
  await nextTick()
  const dataUrl = await renderPng()
  if (token !== renderToken || !dataUrl) return
  pngUrl.value = dataUrl
}

onMounted(() => {
  void refresh()
})

/**
 * 載せる中身が変わったら焼き直す。
 * 配列そのものではなく中身を見る。開設日は後追いで埋まるので、
 * 参照だけを見ていると「同じ 5 件だが表示が変わった」を取りこぼす。
 */
const listKey = computed(() =>
  props.list.map((c) => `${c.channelId}:${c.channelCreatedAt?.getTime() ?? ''}`).join(','),
)
watch(listKey, () => {
  void refresh()
})

/** Event で reject されることもあるので、型を絞らず読める形にする */
function describeError(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`
  if (error instanceof Event) return `${error.type} on ${(error.target as Element)?.tagName}`
  return String(error)
}

/** カードを PNG にする。pngUrl の出し入れは呼び出し側に任せる */
async function renderPng(): Promise<string | null> {
  const node = cardEl()
  if (!node) {
    console.error('[share-card] カード要素が取れない')
    lastError.value = 'カード要素が取れない'
    return null
  }
  generating.value = true
  try {
    const dataUrl = await toPng(node, IMAGE_OPTIONS)
    if (!dataUrl || dataUrl === 'data:,') {
      lastError.value = `空の data URL (${node.offsetWidth}x${node.offsetHeight})`
      return null
    }
    return dataUrl
  } catch (error) {
    // 原因が分からないと直せないので、失敗はコンソールに残す
    console.error('[share-card] 画像の書き出しに失敗', error)
    lastError.value = describeError(error)
    return null
  } finally {
    generating.value = false
  }
}

/**
 * 書き出し済みの PNG を返す。まだ無ければその場で焼く。
 * data URL のままにしているのは、iOS Safari が長押しで
 * 「写真に追加」を出せるのが data: の img だけだから。
 */
async function ensurePng(): Promise<string | null> {
  if (pngUrl.value) return pngUrl.value
  const dataUrl = await renderPng()
  if (dataUrl) pngUrl.value = dataUrl
  return dataUrl
}

async function pngFile(): Promise<File | null> {
  const dataUrl = await ensurePng()
  if (!dataUrl) return null
  try {
    const blob = await (await fetch(dataUrl)).blob()
    return new File([blob], FILE_NAME, { type: 'image/png' })
  } catch (error) {
    console.error('[share-card] data URL から Blob に変換できない', error)
    lastError.value = describeError(error)
    return null
  }
}

/**
 * iOS / iPadOS 判定。この 2 つは a[download] を無視して
 * 画像をタブで開くだけになるので、共有シート経由で写真に保存する。
 */
function isIos(): boolean {
  const ua = navigator.userAgent
  return (
    /iPad|iPhone|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
  )
}

/** a[download] でファイルとして落とす。PC とアンドロイドはこれで写真/ダウンロードに入る */
function saveViaLink(file: File) {
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = FILE_NAME
  document.body.append(a)
  a.click()
  a.remove()
  // click 直後に revoke するとダウンロードが始まらない環境があるので少し置く
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

/**
 * 保存。スマホは共有シートに画像を渡して「写真に保存」を選ばせるのが
 * カメラロールに入る唯一の道なので、対応環境ではそちらを優先する。
 */
async function download() {
  message.value = null
  lastError.value = null
  const file = await pngFile().catch((error) => {
    console.error('[share-card] 保存処理が落ちた', error)
    lastError.value = describeError(error)
    return null
  })
  if (!file) {
    message.value = import.meta.env.DEV
      ? `画像の生成に失敗しました。(${lastError.value ?? '原因不明'})`
      : '画像の生成に失敗しました。'
    return
  }

  const canShareFile = navigator.canShare?.({ files: [file] }) === true
  if (canShareFile && isIos()) {
    try {
      await navigator.share({ files: [file] })
      message.value = '共有メニューの「画像を保存」で写真に入るよ。'
      return
    } catch (error) {
      if ((error as Error | undefined)?.name === 'AbortError') return
      // 共有が使えなかったときはリンク保存に落とす
    }
  }

  saveViaLink(file)
  message.value = '画像を保存しました。'
}

/**
 * OS の共有シートに渡す。投稿文はこちらで用意せず、
 * 画像とサイトの URL だけ渡して本文はユーザーに委ねる。
 * 共有に対応していない環境ではリンクのコピーに落とす。
 */
async function share() {
  sharing.value = true
  message.value = null
  try {
    const url = window.location.origin
    const file = await pngFile()

    if (file && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], url })
    } else if (navigator.share) {
      await navigator.share({ url })
    } else {
      await navigator.clipboard.writeText(url)
      message.value = 'リンクをコピーしました。'
    }
  } catch (error) {
    // 共有シートを閉じただけのときは失敗として扱わない
    if ((error as Error | undefined)?.name !== 'AbortError') {
      message.value = '共有できませんでした。'
    }
  } finally {
    sharing.value = false
  }
}
</script>

<template>
  <div
    ref="root"
    class="fixed inset-0 z-50 flex justify-center overflow-x-hidden overflow-y-auto bg-fg/80 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:p-6 sm:pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
    role="dialog"
    aria-modal="true"
    aria-label="画像の書き出し"
    @click.self="emit('close')"
  >
    <!-- min-w-0 は、枠の中の 360px のカードが幅を押し広げないようにするため -->
    <div class="my-auto flex w-full max-w-90 min-w-0 flex-col items-center gap-6">
      <!-- 縮小率の基準になる領域。枠はこの中で中央に置く -->
      <div ref="area" class="flex w-full justify-center">
        <!-- 縮小したカードのはみ出しを隠す枠 -->
        <div
          ref="frame"
          class="relative overflow-hidden"
          :style="{ width: previewWidth, height: previewHeight }"
        >
          <div :style="{ transform: `scale(${scale})`, transformOrigin: 'top left' }">
            <ShareCard
              data-share-card
              :stats="stats"
              :list="list"
              :list-label="listLabel"
              :avatars="avatars"
            />
          </div>

          <!--
            書き出した PNG をプレビューに重ねる。実体が img なので、
            スマホでは長押しから「写真に追加」で保存できる
          -->
          <img
            v-if="pngUrl"
            :src="pngUrl"
            alt="書き出した画像。長押しで保存できます"
            class="absolute inset-0 h-full w-full"
          />
        </div>
      </div>

      <div ref="controls" class="flex w-full flex-col items-center gap-4 pb-4">
        <!--
          載せる 5 件の選び方。プレビューのすぐ下に置いて、
          押した結果が上のカードで確かめられるようにする。
        -->
        <div class="flex flex-wrap items-center justify-center gap-2 font-round text-[11px]">
          <span
            v-for="g in ORDER_GROUPS"
            :key="g.axis"
            class="flex items-center overflow-hidden rounded-full border-2 border-fg bg-surface"
          >
            <span class="bg-line px-2.5 py-1.5 font-bold text-fg-dim">{{ g.axis }}</span>
            <span class="flex items-center gap-1 px-1.5 py-1">
              <button
                v-for="o in g.options"
                :key="o.value"
                type="button"
                class="rounded-full px-2 py-0.5 transition-colors"
                :aria-pressed="order === o.value"
                :class="pillClass(order === o.value)"
                @click="emit('update:order', o.value)"
              >
                {{ o.label }}
              </button>
            </span>
          </span>

          <!-- 自由選択。押せる状態かどうかで文言を変える -->
          <button
            type="button"
            class="rounded-full border-2 border-fg bg-surface px-3 py-1.5 transition-colors"
            :aria-pressed="order === 'custom'"
            :class="pillClass(order === 'custom')"
            @click="chooseCustom"
          >
            {{ pickedCount === 0 ? '自由に選ぶ' : `自由選択 ${pickedCount}/${SHARE_LIMIT}` }}
          </button>
        </div>

        <p v-if="message" class="font-round text-[11px] text-base">{{ message }}</p>
        <p v-else-if="pngUrl" class="font-round text-[11px] text-base">
          画像を長押しでも保存できるよ
        </p>

        <!-- 主役の「画像を保存」を中央に、脇の 2 つは一段小さく添える -->
        <div class="flex flex-wrap items-center justify-center gap-2.5">
          <button type="button" :class="BUTTON_SUB" :disabled="sharing" @click="share">
            {{ sharing ? '準備中' : '共有' }}
          </button>
          <button type="button" :class="BUTTON_MAIN" :disabled="generating" @click="download">
            {{ generating ? '書き出し中' : '画像を保存' }}
          </button>
          <button type="button" :class="BUTTON_SUB" @click="emit('close')">閉じる</button>
        </div>
      </div>
    </div>
  </div>
</template>
