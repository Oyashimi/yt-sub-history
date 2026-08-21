<script setup lang="ts">
import { computed } from 'vue'
import type { YearBucket } from '@/lib/stats'

const props = defineProps<{ buckets: YearBucket[] }>()

const max = computed(() => Math.max(1, ...props.buckets.map((b) => b.count)))
</script>

<template>
  <section
    v-if="buckets.length"
    class="rounded-2xl border border-ink-line bg-ink-soft/70 px-5 py-5"
  >
    <h2 class="text-sm font-bold text-cream/80">年ごとの登録数</h2>
    <ul class="mt-4 flex items-end gap-1 overflow-x-auto pb-1">
      <li
        v-for="b in buckets"
        :key="b.year"
        class="flex min-w-8 flex-1 flex-col items-center gap-1"
      >
        <span class="text-[10px] tabular-nums text-cream/55">{{ b.count || '' }}</span>
        <div
          class="w-full rounded-t bg-gradient-to-t from-flame/70 to-gold"
          :style="{ height: `${Math.round((b.count / max) * 96) + 2}px` }"
          :title="`${b.year}年: ${b.count}件`"
        />
        <span class="text-[10px] tabular-nums text-cream/45">{{ String(b.year).slice(2) }}</span>
      </li>
    </ul>
  </section>
</template>
