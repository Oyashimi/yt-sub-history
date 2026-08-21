<script setup lang="ts">
import { computed } from 'vue'
import type { YearBucket } from '@/lib/stats'

const props = defineProps<{ buckets: YearBucket[] }>()

const max = computed(() => Math.max(1, ...props.buckets.map((b) => b.count)))
</script>

<template>
  <section v-if="buckets.length">
    <h2 class="text-xs text-fg-dim">年ごとの登録数</h2>
    <ul class="mt-5 flex items-end gap-px overflow-x-auto">
      <li
        v-for="b in buckets"
        :key="b.year"
        class="flex min-w-6 flex-1 flex-col items-center gap-2"
      >
        <div
          class="w-full bg-fg-faint"
          :style="{ height: `${Math.round((b.count / max) * 72) + 1}px` }"
          :title="`${b.year}年: ${b.count}件`"
        />
        <span class="text-[10px] tabular-nums text-fg-faint">
          {{ String(b.year).slice(2) }}
        </span>
      </li>
    </ul>
  </section>
</template>
