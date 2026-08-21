<script setup lang="ts">
import UserCircleIcon from './UserCircleIcon.vue'
import { formatDate, formatElapsed } from '@/lib/format'
import type { SubscribedChannel } from '@/types/youtube'

defineProps<{ channel: SubscribedChannel; rank: number }>()
</script>

<template>
  <li class="flex items-center gap-3 border-b border-line py-3 last:border-0">
    <span class="w-6 shrink-0 text-right font-mono text-[10px] tabular-nums text-fg-faint">
      {{ rank }}
    </span>
    <img
      v-if="channel.thumbnailUrl"
      :src="channel.thumbnailUrl"
      alt=""
      loading="lazy"
      referrerpolicy="no-referrer"
      class="size-8 shrink-0 rounded-full bg-base object-cover"
    />
    <UserCircleIcon v-else class="size-8 shrink-0 text-fg-faint" />
    <a
      :href="`https://www.youtube.com/channel/${channel.channelId}`"
      target="_blank"
      rel="noopener noreferrer"
      class="min-w-0 flex-1 truncate text-[13px] hover:underline"
    >
      {{ channel.title }}
    </a>
    <span class="shrink-0 text-right">
      <time :datetime="channel.publishedAt" class="block font-mono text-[12px] tabular-nums">
        {{ formatDate(channel.subscribedAt) }}
      </time>
      <span class="mt-0.5 block font-round text-[10px] text-fg-faint">
        {{ formatElapsed(channel.subscribedAt) }}
      </span>
    </span>
  </li>
</template>
