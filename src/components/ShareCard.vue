<script setup lang="ts">
import UserCircleIcon from './UserCircleIcon.vue'
import { formatDate, formatElapsed } from '@/lib/format'
import type { Stats } from '@/lib/stats'
import type { SubscribedChannel } from '@/types/youtube'

withDefaults(
  defineProps<{
    stats: Stats
    /** 一覧に載せるチャンネル。並び順は呼び出し側で決める */
    list: SubscribedChannel[]
    /** 一覧の見出し。並び順を切り替えるならここも一緒に差し替える */
    listLabel?: string
    /** channelId → data URL(取得できたものだけ) */
    avatars: Record<string, string>
  }>(),
  { listLabel: '古い順トップ5' },
)

/**
 * 紙の粒子。body::after は position: fixed なので書き出し画像には入らない。
 * カードの中に同じノイズを実要素として敷き直す。
 */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.22'/%3E%3C/svg%3E\")"
</script>

<template>
  <!-- 9:16(360×640)。html-to-image で pixelRatio を上げて書き出す前提の CSS サイズ -->
  <div class="relative h-[640px] w-90 shrink-0 overflow-hidden bg-base text-fg">
    <!-- 紙の粒子。中身より前面に重ねてインクを紙に沈ませる -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 z-10"
      :style="{ backgroundImage: GRAIN, opacity: 0.5, mixBlendMode: 'multiply' }"
    />

    <div class="flex h-full flex-col px-7 py-7">
      <header class="flex items-baseline justify-between gap-3">
        <p class="font-round text-[12px] font-bold">チャンネル登録日チェッカー</p>
        <span class="shrink-0 font-mono text-[9px] tabular-nums text-fg-faint">
          {{ formatDate(new Date()) }}
        </span>
      </header>

      <!-- 主役。このカードの答えなので一番大きく扱う -->
      <template v-if="stats.oldest">
        <!-- pl-5 はカードの角丸 20px に合わせている -->
        <p class="mt-6 mb-1.5 pl-5 font-round text-[11px] font-bold text-fg-dim">最初の登録</p>
        <!--
          影は box-shadow ではなく実要素で敷く。foreignObject 経由の書き出しでは
          Safari が box-shadow の角丸を落とし、角ばった影になってしまうため。
        -->
        <div class="relative">
          <div
            aria-hidden="true"
            class="absolute inset-0 translate-x-1 translate-y-1 rounded-[20px] bg-fg"
          />
          <div class="relative rounded-[20px] border-2 border-fg bg-surface px-5 py-4">
            <div class="flex items-center gap-2.5">
              <img
                v-if="avatars[stats.oldest.channelId]"
                :src="avatars[stats.oldest.channelId]"
                alt=""
                class="size-8 shrink-0 rounded-full bg-base object-cover"
              />
              <UserCircleIcon v-else class="size-8 shrink-0 text-fg-faint" />
              <span class="min-w-0 flex-1 truncate text-[13px]">{{ stats.oldest.title }}</span>
            </div>

            <p class="mt-4 font-mono text-[30px] leading-none font-medium tabular-nums">
              {{ formatDate(stats.oldest.subscribedAt) }}
            </p>
            <p class="mt-3.5 font-round text-[12px] text-fg-dim">
              {{ formatElapsed(stats.oldest.subscribedAt) }}
            </p>
          </div>
        </div>
      </template>

      <!-- 集計値。結果画面と同じ 3 枠 -->
      <dl class="mt-4 grid grid-cols-3 items-stretch gap-2">
        <div class="rounded-2xl border border-fg bg-surface px-2 py-3 text-center">
          <dt class="text-[9px] text-fg-dim">チャンネル開設</dt>
          <dd
            v-if="stats.oldest?.channelCreatedAt"
            class="mt-1.5 font-mono text-[13px] leading-none font-medium tabular-nums"
          >
            {{ formatDate(stats.oldest.channelCreatedAt) }}
          </dd>
          <dd v-else class="mt-1.5 font-round text-[19px] leading-none font-bold">—</dd>
        </div>
        <div class="rounded-2xl border border-fg bg-surface px-2 py-3 text-center">
          <dt class="text-[9px] text-fg-dim">経過年数</dt>
          <dd class="mt-1.5 font-round text-[19px] leading-none font-bold tabular-nums">
            {{ stats.yearsSinceOldest }}
          </dd>
        </div>
        <div class="rounded-2xl border border-fg bg-surface px-2 py-3 text-center">
          <dt class="text-[9px] text-fg-dim">登録チャンネル</dt>
          <dd class="mt-1.5 font-round text-[19px] leading-none font-bold tabular-nums">
            {{ stats.total }}
          </dd>
        </div>
      </dl>

      <!-- 一覧 -->
      <p class="mt-5 mb-1.5 pl-5 font-round text-[11px] font-bold text-fg-dim">
        {{ listLabel }}
      </p>
      <ol class="flex-1 rounded-[20px] border-2 border-fg bg-surface px-4 py-1">
        <li
          v-for="(c, i) in list"
          :key="c.channelId"
          class="flex items-center gap-2.5 border-b border-line py-2.5 last:border-0"
        >
          <span class="w-3 shrink-0 text-right font-mono text-[9px] tabular-nums text-fg-faint">
            {{ i + 1 }}
          </span>
          <img
            v-if="avatars[c.channelId]"
            :src="avatars[c.channelId]"
            alt=""
            class="size-6 shrink-0 rounded-full bg-base object-cover"
          />
          <UserCircleIcon v-else class="size-6 shrink-0 text-fg-faint" />
          <span class="min-w-0 flex-1 truncate text-[11px]">{{ c.title }}</span>
          <span class="shrink-0 font-mono text-[10px] tabular-nums text-fg-dim">
            {{ formatDate(c.subscribedAt) }}
          </span>
        </li>
      </ol>
    </div>
  </div>
</template>
