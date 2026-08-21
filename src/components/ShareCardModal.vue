<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import { toBlob, toPng } from 'html-to-image'
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

const cardRef = useTemplateRef<InstanceType<typeof ShareCard>>('card')
const frameRef = useTemplateRef<HTMLElement>('frame')
const avatars = ref<Record<string, string>>({})
const generating = ref(false)
const sharing = ref(false)
const message = ref<string | null>(null)

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
})

function cardEl(): HTMLElement | null {
  const el = cardRef.value?.$el
  return el instanceof HTMLElement ? el : null
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

async function download() {
  const node = cardEl()
  if (!node) return
  generating.value = true
  message.value = null
  try {
    const dataUrl = await toPng(node, IMAGE_OPTIONS)
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = FILE_NAME
    a.click()
    message.value = '画像を保存しました。'
  } catch {
    message.value = '画像の生成に失敗しました。'
  } finally {
    generating.value = false
  }
}

/**
 * OS の共有シートに渡す。投稿文はこちらで用意せず、
 * 画像とサイトの URL だけ渡して本文はユーザーに委ねる。
 * 共有に対応していない環境ではリンクのコピーに落とす。
 */
async function share() {
  const node = cardEl()
  if (!node) return
  sharing.value = true
  message.value = null
  try {
    const url = window.location.origin
    const blob = await toBlob(node, IMAGE_OPTIONS)
    const file = blob ? new File([blob], FILE_NAME, { type: 'image/png' }) : null

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
        class="w-full overflow-hidden"
        :style="{ height: previewHeight }"
      >
        <div :style="{ transform: `scale(${scale})`, transformOrigin: 'top left' }">
          <ShareCard
            ref="card"
            :stats="stats"
            :list="list"
            :list-label="listLabel"
            :avatars="avatars"
          />
        </div>
      </div>

      <div class="flex w-full flex-col items-center gap-4 pb-4">
        <p v-if="message" class="font-round text-[11px] text-base">{{ message }}</p>

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
