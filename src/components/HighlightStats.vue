<script setup lang="ts">
import UserCircleIcon from './UserCircleIcon.vue'
import { formatDate, formatElapsed, formatSpan, formatTime } from '@/lib/format'
import type { Stats } from '@/lib/stats'

defineProps<{ stats: Stats }>()
</script>

<template>
  <div>
    <!-- 最初の登録。このサイトの答えなので一番大きく扱う -->
    <template v-if="stats.oldest">
      <p class="mb-1.5 pl-6 font-round text-[12px] font-bold text-fg-dim">最初の登録</p>
      <div
        class="rounded-3xl border-2 border-fg bg-surface px-6 py-6"
      >
        <div class="flex items-center gap-3">
          <img
            v-if="stats.oldest.thumbnailUrl"
            :src="stats.oldest.thumbnailUrl"
            alt=""
            referrerpolicy="no-referrer"
            class="size-9 shrink-0 rounded-full bg-base object-cover"
          />
          <UserCircleIcon v-else class="size-9 shrink-0 text-fg-faint" />
          <a
            :href="`https://www.youtube.com/channel/${stats.oldest.channelId}`"
            target="_blank"
            rel="noopener noreferrer"
            class="min-w-0 flex-1 truncate text-[14px] hover:underline"
          >
            {{ stats.oldest.title }}
          </a>
        </div>

        <p
          class="mt-5 font-mono text-[clamp(1.625rem,7vw,2rem)] leading-none font-medium tabular-nums"
        >
          {{ formatDate(stats.oldest.subscribedAt) }}
          <span class="text-[0.62em] text-fg-dim">
            {{ formatTime(stats.oldest.subscribedAt) }}
          </span>
        </p>
        <p class="mt-3 font-round text-[13px] text-fg-dim">
          {{ formatElapsed(stats.oldest.subscribedAt) }}
        </p>

        <!-- 開設日は後追いで入る。取得できるまで/できなければ出さない -->
        <p
          v-if="stats.oldest.channelCreatedAt"
          class="mt-5 border-t border-line pt-4 text-[11px] text-fg-dim"
        >
          チャンネル開設から
          <span class="font-round font-bold text-fg">
            {{ formatSpan(stats.oldest.channelCreatedAt, stats.oldest.subscribedAt) }}
          </span>
          後に登録
        </p>
      </div>
    </template>

    <!--
      集計値。
      「チャンネル開設」は日付と時刻が入って一番幅を要するので、
      常に 1 行使い切らせ、残りの 2 つを下段に 2 列で並べる。
    -->
    <dl class="mt-5 grid grid-cols-2 items-stretch gap-2.5">
      <div class="col-span-2 rounded-2xl border border-fg bg-surface px-3 py-3.5 text-center">
        <dt class="text-[10px] text-fg-dim">チャンネル開設</dt>
        <!-- 時刻は主役カードと同じ 0.62em。日付に添える扱いにする -->
        <dd
          v-if="stats.oldest?.channelCreatedAt"
          class="mt-1.5 font-mono text-[22px] leading-none font-medium tabular-nums"
        >
          {{ formatDate(stats.oldest.channelCreatedAt) }}
          <span class="text-[0.62em] text-fg-dim">
            {{ formatTime(stats.oldest.channelCreatedAt) }}
          </span>
        </dd>
        <dd v-else class="mt-1.5 font-round text-[22px] leading-none font-bold">—</dd>
      </div>
      <div class="rounded-2xl border border-fg bg-surface px-3 py-3.5 text-center">
        <dt class="text-[10px] text-fg-dim">経過年数</dt>
        <dd class="mt-1.5 font-round text-[22px] leading-none font-bold tabular-nums">
          {{ stats.yearsSinceOldest }}
        </dd>
      </div>
      <div class="rounded-2xl border border-fg bg-surface px-3 py-3.5 text-center">
        <dt class="text-[10px] text-fg-dim">登録チャンネル</dt>
        <dd class="mt-1.5 font-round text-[22px] leading-none font-bold tabular-nums">
          {{ stats.total }}
        </dd>
      </div>
    </dl>
  </div>
</template>
