<script setup lang="ts">
import { computed } from 'vue'
import UserCircleIcon from './UserCircleIcon.vue'
import { formatDate, formatElapsed, formatSpan, formatTime } from '@/lib/format'
import type { SubscribedChannel } from '@/types/youtube'

const props = defineProps<{ channel: SubscribedChannel; rank: number }>()

/** 開設からどれだけ経ってから登録したか。開設日が未取得なら null */
const sinceOpen = computed(() => {
  const created = props.channel.channelCreatedAt
  if (!created) return null
  return formatSpan(created, props.channel.subscribedAt)
})
</script>

<template>
  <li class="border-b border-line py-4 last:border-0">
    <!--
      1 行目: 連番・アイコン・チャンネル名。
      下線は行間の区切り(border-line)より意図的に弱くしている。
      同じ強さだと「行の区切り」と混ざって、リストが 2 倍の行数に見えるため。
    -->
    <div class="flex items-center gap-3.5 border-b border-line/50 pb-3">
      <span class="w-5 shrink-0 text-right font-mono text-[10px] tabular-nums text-fg-faint">
        {{ rank }}
      </span>
      <img
        v-if="channel.thumbnailUrl"
        :src="channel.thumbnailUrl"
        alt=""
        loading="lazy"
        referrerpolicy="no-referrer"
        class="size-10 shrink-0 rounded-full bg-base object-cover"
      />
      <UserCircleIcon v-else class="size-10 shrink-0 text-fg-faint" />
      <a
        :href="`https://www.youtube.com/channel/${channel.channelId}`"
        target="_blank"
        rel="noopener noreferrer"
        class="min-w-0 flex-1 truncate text-[14px] hover:underline"
      >
        {{ channel.title }}
      </a>
    </div>

    <!--
      2 行目以降: 日付。pl-22(88px) はチャンネル名の左端に合わせた値で、
      内訳は 連番 20px + gap 14px + アイコン 40px + gap 14px。
      上の 3 つのどれかを変えたらここも合わせること。
    -->
    <div class="pt-3 pl-22">
      <time
        :datetime="channel.publishedAt"
        class="block font-mono text-[13px] tabular-nums"
      >
        {{ formatDate(channel.subscribedAt) }}
        <span class="text-fg-dim">{{ formatTime(channel.subscribedAt) }}</span>
      </time>
      <p class="mt-1 text-[10px] text-fg-faint">
        <span v-if="sinceOpen">開設から{{ sinceOpen }}後 ・ </span>
        {{ formatElapsed(channel.subscribedAt) }}
      </p>
    </div>
  </li>
</template>
