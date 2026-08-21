<script setup lang="ts">
import { computed } from 'vue'
import type { YearBucket } from '@/lib/stats'

const props = defineProps<{ buckets: YearBucket[] }>()

const max = computed(() => Math.max(1, ...props.buckets.map((b) => b.count)))
</script>

<template>
  <section v-if="buckets.length">
    <p class="mb-1.5 pl-6 font-round text-[12px] font-bold text-fg-dim">年ごとの登録数</p>
    <div class="rounded-3xl border-2 border-fg bg-surface px-5 pt-5 pb-4">
      <ul class="flex h-28 items-end gap-[3px]">
        <li
          v-for="b in buckets"
          :key="b.year"
          class="flex h-full flex-1 items-end"
          :title="`${b.year}年 ${b.count}件`"
        >
          <span
            class="w-full rounded-sm bg-fg"
            :style="{ height: `${Math.max(2, Math.round((b.count / max) * 100))}%` }"
          />
        </li>
      </ul>

      <!-- 目盛り。年数が多いと詰まるので下 2 桁のみ -->
      <div class="mt-2 flex gap-[3px] border-t border-line pt-2">
        <span
          v-for="b in buckets"
          :key="b.year"
          class="flex-1 text-center font-mono text-[8px] tabular-nums text-fg-faint sm:text-[9px]"
        >
          {{ String(b.year).slice(2) }}
        </span>
      </div>
    </div>
  </section>
</template>
