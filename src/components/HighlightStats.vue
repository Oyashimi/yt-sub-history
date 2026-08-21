<script setup lang="ts">
import { formatDate, formatElapsed } from '@/lib/format'
import type { Stats } from '@/lib/stats'

defineProps<{ stats: Stats }>()
</script>

<template>
  <div>
    <div v-if="stats.oldest" class="border-t border-line pt-6">
      <p class="text-xs text-fg-dim">最初の登録</p>
      <p class="mt-3 text-sm">{{ stats.oldest.title }}</p>
      <p class="mt-1.5 text-3xl font-light tabular-nums tracking-tight">
        {{ formatDate(stats.oldest.subscribedAt) }}
      </p>
      <p class="mt-1.5 text-xs text-fg-dim">
        {{ formatElapsed(stats.oldest.subscribedAt) }}
      </p>
    </div>

    <dl class="mt-8 grid grid-cols-3 gap-px overflow-hidden border-y border-line bg-line">
      <div class="bg-base px-1 py-4">
        <dt class="text-xs text-fg-dim">登録チャンネル</dt>
        <dd class="mt-1.5 text-xl font-light tabular-nums">{{ stats.total }}</dd>
      </div>
      <div class="bg-base px-1 py-4">
        <dt class="text-xs text-fg-dim">経過年数</dt>
        <dd class="mt-1.5 text-xl font-light tabular-nums">{{ stats.yearsSinceOldest }}</dd>
      </div>
      <div class="bg-base px-1 py-4">
        <dt class="text-xs text-fg-dim">最多の年</dt>
        <dd class="mt-1.5 text-xl font-light tabular-nums">
          {{ stats.busiestYear?.year ?? '—' }}
        </dd>
      </div>
    </dl>
  </div>
</template>
