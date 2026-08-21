<script setup lang="ts">
import { formatDate, formatElapsed } from '@/lib/format'
import type { SubscribedChannel } from '@/types/youtube'

defineProps<{ channel: SubscribedChannel; rank: number }>()
</script>

<template>
  <li class="flex items-center gap-4 border-b border-line py-3">
    <span class="w-7 shrink-0 text-right text-xs tabular-nums text-fg-faint">
      {{ rank }}
    </span>
    <img
      :src="channel.thumbnailUrl"
      alt=""
      loading="lazy"
      referrerpolicy="no-referrer"
      class="size-8 shrink-0 rounded-full bg-surface object-cover"
    />
    <div class="min-w-0 flex-1">
      <a
        :href="`https://www.youtube.com/channel/${channel.channelId}`"
        target="_blank"
        rel="noopener noreferrer"
        class="block truncate text-sm transition-colors hover:text-fg-dim"
      >
        {{ channel.title }}
      </a>
    </div>
    <div class="shrink-0 text-right">
      <time :datetime="channel.publishedAt" class="block text-xs tabular-nums text-fg-dim">
        {{ formatDate(channel.subscribedAt) }}
      </time>
      <span class="mt-0.5 block text-[10px] text-fg-faint">
        {{ formatElapsed(channel.subscribedAt) }}
      </span>
    </div>
  </li>
</template>
