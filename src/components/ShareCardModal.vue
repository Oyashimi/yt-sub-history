<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from 'vue'
import { toPng } from 'html-to-image'
import ShareCard from './ShareCard.vue'
import { toDataUrl } from '@/lib/image'
import type { Stats } from '@/lib/stats'
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
    a.download = 'subscribed-since.png'
    a.click()
    message.value = '画像を保存しました。'
  } catch {
    message.value = '画像の生成に失敗しました。'
  } finally {
    generating.value = false
  }
}

/** 投稿文はこちらで用意しない。URL だけ渡して本文はユーザーに委ねる */
function shareToX() {
  const url = new URL('https://twitter.com/intent/tweet')
  url.searchParams.set('url', window.location.origin)
  window.open(url.toString(), '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/85 p-6"
    role="dialog"
    aria-modal="true"
    aria-label="画像の書き出し"
    @click.self="emit('close')"
  >
    <div class="my-auto flex flex-col items-center gap-6">
      <ShareCard ref="card" :stats="stats" :top5="top5" :avatars="avatars" />

      <div class="flex w-90 max-w-full flex-col gap-4 pb-4">
        <p v-if="message" class="text-xs text-fg-dim">{{ message }}</p>

        <div class="flex items-center gap-5">
          <button
            type="button"
            class="border border-line bg-surface px-5 py-2.5 text-sm transition-colors hover:border-fg-faint disabled:text-fg-faint"
            :disabled="generating"
            @click="download"
          >
            {{ generating ? '書き出し中' : '画像を保存' }}
          </button>
          <button
            type="button"
            class="text-sm text-fg-dim underline underline-offset-4 transition-colors hover:text-fg"
            @click="shareToX"
          >
            X を開く
          </button>
          <button
            type="button"
            class="ml-auto text-sm text-fg-dim underline underline-offset-4 transition-colors hover:text-fg"
            @click="emit('close')"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
