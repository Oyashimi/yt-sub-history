<script setup lang="ts">
import { computed } from 'vue'
import { formatDate, formatElapsed } from '@/lib/format'
import { veteranTitle, type Stats } from '@/lib/stats'

const props = defineProps<{ stats: Stats }>()
const title = computed(() => veteranTitle(props.stats.veteranYears))
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-3">
    <div
      class="sm:col-span-3 rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/[0.12] to-transparent px-5 py-6"
    >
      <p class="text-xs font-bold tracking-wide text-gold/80">あなたの古参度</p>
      <p class="mt-2 text-3xl sm:text-4xl font-black">
        {{ title.emoji }} {{ title.label }}
        <span class="text-gradient-gold">YouTube 歴 {{ stats.veteranYears }} 年</span>
      </p>
      <p v-if="stats.oldest" class="mt-3 text-sm text-cream/65">
        最古の登録は
        <strong class="text-cream">{{ stats.oldest.title }}</strong>
        （{{ formatDate(stats.oldest.subscribedAt) }} ／
        {{ formatElapsed(stats.oldest.subscribedAt) }}）
      </p>
    </div>

    <div class="rounded-2xl border border-ink-line bg-ink-soft/70 px-5 py-4">
      <p class="text-xs text-cream/50">登録チャンネル数</p>
      <p class="mt-1 text-3xl font-black">{{ stats.total }}</p>
    </div>
    <div class="rounded-2xl border border-ink-line bg-ink-soft/70 px-5 py-4">
      <p class="text-xs text-cream/50">10 年以上の付き合い</p>
      <p class="mt-1 text-3xl font-black">
        {{ stats.overTenYears.length
        }}<span class="ml-1 text-base font-bold text-cream/50">ch</span>
      </p>
    </div>
    <div class="rounded-2xl border border-ink-line bg-ink-soft/70 px-5 py-4">
      <p class="text-xs text-cream/50">最も登録した年</p>
      <p class="mt-1 text-3xl font-black">
        {{ stats.busiestYear?.year ?? '—'
        }}<span v-if="stats.busiestYear" class="ml-1 text-base font-bold text-cream/50"
          >／{{ stats.busiestYear.count }}ch</span
        >
      </p>
    </div>
  </div>
</template>
