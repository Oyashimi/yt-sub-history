<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import { toPng } from 'html-to-image'
import ShareCard from './ShareCard.vue'
import { toDataUrl } from '@/lib/image'
import type { Stats } from '@/lib/stats'
import type { SubscribedChannel } from '@/types/youtube'

const props = defineProps<{
  stats: Stats
  /** カードに載せるチャンネル。並び順は呼び出し側で決める */
  list: SubscribedChannel[]
  listLabel?: string
}>()
const emit = defineEmits<{ close: [] }>()

const frameRef = useTemplateRef<HTMLElement>('frame')
const avatars = ref<Record<string, string>>({})
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

onMounted(async () => {
  // カードに出るサムネだけインライン化する。一覧に載らない場合もある最古の 1 件も含める
  const targets = [...props.list]
  const oldest = props.stats.oldest
  if (oldest && !targets.some((c) => c.channelId === oldest.channelId)) targets.push(oldest)

  const entries = await Promise.all(
    targets.map(async (c) => [c.channelId, await toDataUrl(c.thumbnailUrl)] as const),
  )
  avatars.value = Object.fromEntries(
    entries.filter((e): e is readonly [string, string] => e[1] !== null),
  )
  // サムネが載った状態で先に書き出しておく。長押し保存をボタン待ちにしないため
  await nextTick()
  await ensurePng()
})

/**
 * 書き出し対象のカード要素。ShareCard の $el は当てにならないので
 * data 属性を目印に DOM から引く。
 */
function cardEl(): HTMLElement | null {
  return frameRef.value?.querySelector<HTMLElement>('[data-share-card]') ?? null
}

/**
 * プレビューの縮小率。カードは書き出しのために 360px 固定なので、
 * 画面が狭いときは transform で縮めて横スクロールを出さない。
 * transform はカードを包む要素に掛ける。カード自身に掛けると書き出しに影響する。
 */
const scale = ref(1)
/** ShareCard の h-[640px] に合わせた初期値。マウント後に実測で上書きする */
const cardHeight = ref(640)
/** 縮小してもレイアウト上の高さは元のままなので、枠側で詰める */
const previewHeight = computed(() => `${Math.round(cardHeight.value * scale.value)}px`)

function fit() {
  const frame = frameRef.value
  const node = cardEl()
  if (!frame || !node) return
  // offsetWidth/offsetHeight は transform の影響を受けないので縮小中でも元の寸法が取れる
  cardHeight.value = node.offsetHeight
  scale.value = Math.min(1, frame.clientWidth / node.offsetWidth)
}

let frameObserver: ResizeObserver | null = null

onMounted(() => {
  fit()
  const frame = frameRef.value
  if (frame && typeof ResizeObserver !== 'undefined') {
    frameObserver = new ResizeObserver(fit)
    frameObserver.observe(frame)
  }
})

onBeforeUnmount(() => frameObserver?.disconnect())

/** Event で reject されることもあるので、型を絞らず読める形にする */
function describeError(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`
  if (error instanceof Event) return `${error.type} on ${(error.target as Element)?.tagName}`
  return String(error)
}

/**
 * カードを PNG にして data URL を控える。以降は焼き直さず使い回す。
 * data URL のままにしているのは、iOS Safari が長押しで
 * 「写真に追加」を出せるのが data: の img だけだから。
 */
async function ensurePng(): Promise<string | null> {
  if (pngUrl.value) return pngUrl.value
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
    pngUrl.value = dataUrl
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
    class="fixed inset-0 z-50 flex justify-center overflow-x-hidden overflow-y-auto bg-fg/80 p-4 sm:p-6"
    role="dialog"
    aria-modal="true"
    aria-label="画像の書き出し"
    @click.self="emit('close')"
  >
    <!-- min-w-0 は、枠の中の 360px のカードが幅を押し広げないようにするため -->
    <div class="my-auto flex w-full max-w-90 min-w-0 flex-col items-center gap-6">
      <!-- 縮小したカードのはみ出しを隠す枠。幅は親に追従する -->
      <div
        ref="frame"
        class="relative w-full overflow-hidden"
        :style="{ height: previewHeight }"
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

      <div class="flex w-full flex-col items-center gap-4 pb-4">
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
