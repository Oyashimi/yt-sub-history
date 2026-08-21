<script setup lang="ts">
import { computed } from 'vue'
import type { YearBucket } from '@/lib/stats'
import { axisHit, type AxisFilter } from '@/composables/useSubscriptions'

const props = defineProps<{ buckets: YearBucket[]; filter: AxisFilter }>()
const emit = defineEmits<{ select: [year: number] }>()

const max = computed(() => Math.max(1, ...props.buckets.map((b) => b.count)))

/** 登録年フィルタが成立しているか(値が未選択なら成立していない) */
const hasSelection = computed(() => axisHit(props.filter, 0) !== null)
const isOn = (year: number) => axisHit(props.filter, year) === true
</script>

<template>
  <section v-if="buckets.length">
    <p class="mb-1.5 pl-6 font-round text-[12px] font-bold text-fg-dim">
      年ごとの登録数
      <span class="ml-1 font-normal text-fg-faint">グラフをクリックで年を選択できるよ</span>
    </p>

    <div class="rounded-3xl border-2 border-fg bg-surface px-5 pt-5 pb-4">
      <ul class="flex items-stretch gap-[3px]">
        <li v-for="b in buckets" :key="b.year" class="flex-1">
          <button
            type="button"
            class="group flex w-full cursor-pointer flex-col items-center pt-2"
            :aria-pressed="isOn(b.year)"
            :aria-label="`${b.year}年 ${b.count}件`"
            @click="emit('select', b.year)"
          >
            <span class="flex h-28 w-full items-end justify-center">
              <span
                class="w-full max-w-11 rounded-sm bg-fg transition-opacity"
                :class="
                  hasSelection && !isOn(b.year)
                    ? 'opacity-20'
                    : 'opacity-100 group-hover:opacity-70'
                "
                :style="{ height: `${Math.max(2, Math.round((b.count / max) * 100))}%` }"
              />
            </span>
            <span
              class="pt-2 font-mono text-[8px] tabular-nums transition-colors sm:text-[9px]"
              :class="
                isOn(b.year) ? 'font-bold text-fg' : 'text-fg-faint'
              "
            >
              {{ String(b.year).slice(2) }}
            </span>
          </button>
        </li>
      </ul>
    </div>
  </section>
</template>
