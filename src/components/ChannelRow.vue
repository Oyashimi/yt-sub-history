<script setup lang="ts">
import { computed } from 'vue'
import { elapsedYears, formatDate, formatElapsed } from '@/lib/format'
import type { SubscribedChannel } from '@/types/youtube'

const props = defineProps<{ channel: SubscribedChannel; rank: number }>()

const years = computed(() => elapsedYears(props.channel.subscribedAt))
const badge = computed(() => {
  if (years.value >= 10) return { label: '10年超', cls: 'border-gold/50 bg-gold/15 text-gold' }
  if (years.value >= 5)
    return { label: '5年超', cls: 'border-flame/40 bg-flame/10 text-flame' }
  return null
})
</script>

<template>
  <li
    class="flex items-center gap-3 rounded-xl border border-ink-line bg-ink-soft/60 px-3 py-2.5 transition hover:border-cream/25"
  >
    <span class="w-8 shrink-0 text-right text-xs tabular-nums text-cream/35">
      {{ rank }}
    </span>
    <img
      :src="channel.thumbnailUrl"
      :alt="''"
      loading="lazy"
      referrerpolicy="no-referrer"
      class="size-10 shrink-0 rounded-full bg-ink-line object-cover"
    />
    <div class="min-w-0 flex-1">
      <a
        :href="`https://www.youtube.com/channel/${channel.channelId}`"
        target="_blank"
        rel="noopener noreferrer"
        class="block truncate text-sm font-bold hover:underline"
      >
        {{ channel.title }}
      </a>
      <p class="mt-0.5 flex items-center gap-2 text-xs text-cream/50">
        <time :datetime="channel.publishedAt">{{ formatDate(channel.subscribedAt) }}</time>
        <span class="text-cream/30">·</span>
        <span>{{ formatElapsed(channel.subscribedAt) }}</span>
      </p>
    </div>
    <span
      v-if="badge"
      class="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold"
      :class="badge.cls"
    >
      {{ badge.label }}
    </span>
  </li>
</template>
