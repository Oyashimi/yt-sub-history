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
  <section class="mx-auto max-w-xl px-6 pt-40 pb-16">
    <p class="text-sm text-fg-dim">読み込んでいます</p>
    <p class="mt-2 text-sm tabular-nums text-fg">
      {{ progress.loaded }}<span v-if="progress.total"> / {{ progress.total }}</span> 件
    </p>

    <div class="mt-6 h-px w-full bg-line" role="status" aria-label="読み込み中">
      <div
        v-if="percent !== null"
        class="h-px bg-fg-dim transition-[width] duration-300"
        :style="{ width: `${percent}%` }"
      />
    </div>
  </section>
</template>
