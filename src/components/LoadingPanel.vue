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
  <section class="mx-auto max-w-xl px-6 pt-32 pb-20 sm:pt-44">
    <p class="text-center font-round text-[13px] font-bold text-fg-dim">読み込み中</p>

    <!-- 取得済みの件数。数字そのものを見せ場にする -->
    <p class="mt-5 text-center">
      <span class="font-round text-[64px] leading-none font-bold tabular-nums">
        {{ progress.loaded }}
      </span>
      <span class="ml-1.5 font-round text-[15px] text-fg-dim">件</span>
    </p>

    <p v-if="progress.total" class="mt-2 text-center text-[12px] tabular-nums text-fg-faint">
      全 {{ progress.total }} 件
    </p>

    <!-- 枠付きのベタ塗りバー。グラデーションは使わない -->
    <div
      class="mx-auto mt-9 h-4 max-w-sm overflow-hidden rounded-full border border-fg bg-surface"
      role="progressbar"
      :aria-valuenow="percent ?? undefined"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label="読み込み中"
    >
      <div
        v-if="percent !== null"
        class="h-full bg-fg transition-[width] duration-300 ease-out"
        :style="{ width: `${percent}%` }"
      />
      <div v-else class="animate-bar-sweep h-full w-1/4 bg-fg" />
    </div>
  </section>
</template>
