<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from 'vue'
import { toPng } from 'html-to-image'
import ShareCard from './ShareCard.vue'
import { toDataUrl } from '@/lib/image'
import { veteranTitle, type Stats } from '@/lib/stats'
import type { SubscribedChannel } from '@/types/youtube'

const props = defineProps<{ stats: Stats; top5: SubscribedChannel[] }>()
const emit = defineEmits<{ close: [] }>()

const cardRef = useTemplateRef<InstanceType<typeof ShareCard>>('card')
const avatars = ref<Record<string, string>>({})
const generating = ref(false)
const message = ref<string | null>(null)

onMounted(async () => {
  // カードに載せる 5 件だけサムネをインライン化する
  const entries = await Promise.all(
    props.top5.map(async (c) => [c.channelId, await toDataUrl(c.thumbnailUrl)] as const),
  )
  avatars.value = Object.fromEntries(
    entries.filter((e): e is readonly [string, string] => e[1] !== null),
  )
})

function cardEl(): HTMLElement | null {
  const el = cardRef.value?.$el
  return el instanceof HTMLElement ? el : null
}

async function download() {
  const node = cardEl()
  if (!node) return
  generating.value = true
  message.value = null
  try {
    const dataUrl = await toPng(node, { pixelRatio: 3, cacheBust: true, skipFonts: true })
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = 'youtube-veteran-card.png'
    a.click()
    message.value = '画像を保存しました。X に貼って古参自慢しよう!'
  } catch {
    message.value = '画像の生成に失敗しました。スクリーンショットでも代用できます。'
  } finally {
    generating.value = false
  }
}

function shareToX() {
  const { veteranYears, total, oldest } = props.stats
  const title = veteranTitle(veteranYears)
  const lines = [
    `${title.emoji} 私の YouTube 歴は ${veteranYears} 年（${title.label}）`,
    oldest ? `最古参は「${oldest.title}」` : '',
    `登録 ${total} チャンネル`,
    '',
    '#YouTube古参チェッカー',
  ].filter(Boolean)
  const url = new URL('https://twitter.com/intent/tweet')
  url.searchParams.set('text', lines.join('\n'))
  url.searchParams.set('url', window.location.origin)
  window.open(url.toString(), '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    aria-label="シェアカード"
    @click.self="emit('close')"
  >
    <div class="my-auto flex flex-col items-center gap-4">
      <div class="overflow-hidden rounded-2xl shadow-2xl shadow-black/60">
        <ShareCard ref="card" :stats="stats" :top5="top5" :avatars="avatars" />
      </div>

      <p v-if="message" class="max-w-90 text-center text-xs text-cream/70">{{ message }}</p>

      <div class="flex w-90 max-w-full flex-col gap-2 pb-4">
        <button
          type="button"
          class="rounded-full bg-gold px-6 py-3 text-sm font-black text-ink transition hover:brightness-110 disabled:opacity-60"
          :disabled="generating"
          @click="download"
        >
          {{ generating ? '生成中…' : '📥 画像を保存する' }}
        </button>
        <button
          type="button"
          class="rounded-full bg-cream px-6 py-3 text-sm font-bold text-ink transition hover:brightness-95"
          @click="shareToX"
        >
          𝕏 でシェアする（画像は手動で添付）
        </button>
        <button
          type="button"
          class="rounded-full border border-cream/25 px-6 py-2.5 text-sm font-bold text-cream/75 transition hover:text-cream"
          @click="emit('close')"
        >
          閉じる
        </button>
      </div>
    </div>
  </div>
</template>
