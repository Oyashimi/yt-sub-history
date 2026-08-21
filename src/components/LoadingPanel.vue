<script setup lang="ts">
import { computed } from 'vue'
import type { FetchProgress } from '@/lib/youtube'

const props = defineProps<{ progress: FetchProgress }>()

const percent = computed(() => {
  const { loaded, total } = props.progress
  if (!total) return null
  return Math.min(100, Math.round((loaded / total) * 100))
})
</script>

<template>
  <section class="mx-auto max-w-md px-5 py-28 text-center">
    <div
      class="mx-auto size-14 animate-spin rounded-full border-4 border-ink-line border-t-gold"
      role="status"
      aria-label="読み込み中"
    />
    <p class="mt-8 text-lg font-bold">登録チャンネルを掘り起こしています…</p>
    <p class="mt-2 text-sm text-cream/60">
      {{ progress.loaded }} 件取得済み<span v-if="progress.total">
        / 全 {{ progress.total }} 件</span
      >
    </p>

    <div v-if="percent !== null" class="mt-5 h-2 overflow-hidden rounded-full bg-ink-line">
      <div
        class="h-full rounded-full bg-gradient-to-r from-flame to-gold transition-[width] duration-300"
        :style="{ width: `${percent}%` }"
      />
    </div>
  </section>
</template>
