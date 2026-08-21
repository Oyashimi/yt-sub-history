<script setup lang="ts">
import { formatDate } from '@/lib/format'
import type { Stats } from '@/lib/stats'
import type { SubscribedChannel } from '@/types/youtube'

defineProps<{
  stats: Stats
  top5: SubscribedChannel[]
  /** channelId → data URL(取得できたものだけ) */
  avatars: Record<string, string>
}>()

const initial = (name: string) => Array.from(name.trim())[0] ?? '?'
</script>

<template>
  <!-- 9:16。html-to-image で pixelRatio を上げて書き出す前提の CSS サイズ -->
  <div
    class="flex h-[640px] w-90 shrink-0 flex-col px-8 py-10"
    style="background: #0d0d0d; color: #e8e8e6"
  >
    <p class="text-[10px] tracking-widest text-[#6a6a67]">SUBSCRIBED SINCE</p>

    <div v-if="stats.oldest" class="mt-7">
      <p class="text-[11px] text-[#9a9a97]">最初の登録</p>
      <p class="mt-2.5 text-[34px] leading-none font-light tabular-nums tracking-tight">
        {{ formatDate(stats.oldest.subscribedAt) }}
      </p>
      <p class="mt-3 truncate text-[13px]">{{ stats.oldest.title }}</p>
    </div>

    <dl class="mt-8 flex gap-8 border-y border-[#232323] py-4">
      <div>
        <dt class="text-[10px] text-[#9a9a97]">登録チャンネル</dt>
        <dd class="mt-1 text-[19px] font-light tabular-nums">{{ stats.total }}</dd>
      </div>
      <div>
        <dt class="text-[10px] text-[#9a9a97]">経過年数</dt>
        <dd class="mt-1 text-[19px] font-light tabular-nums">{{ stats.yearsSinceOldest }}</dd>
      </div>
    </dl>

    <ol class="mt-7 flex-1 space-y-4">
      <li
        v-for="c in top5"
        :key="c.channelId"
        class="flex items-center gap-3"
      >
        <img
          v-if="avatars[c.channelId]"
          :src="avatars[c.channelId]"
          alt=""
          class="size-7 shrink-0 rounded-full object-cover"
        />
        <span
          v-else
          class="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#232323] text-[11px] text-[#9a9a97]"
        >
          {{ initial(c.title) }}
        </span>
        <span class="min-w-0 flex-1 truncate text-[12px]">{{ c.title }}</span>
        <span class="shrink-0 text-[11px] tabular-nums text-[#9a9a97]">
          {{ formatDate(c.subscribedAt) }}
        </span>
      </li>
    </ol>

    <p class="border-t border-[#232323] pt-4 text-[10px] text-[#6a6a67]">
      {{ stats.oldest ? formatDate(stats.oldest.subscribedAt) : '' }} —
      {{ formatDate(new Date()) }}
    </p>
  </div>
</template>
