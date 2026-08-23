<script setup lang="ts">
import UserCircleIcon from './UserCircleIcon.vue'
import { formatDate, formatSpan } from '@/lib/format'
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
  { listLabel: '登録が古い順' },
)

/**
 * 開設からどれだけ経って登録したか。
 * 開設日は後追いで埋まる値なので、まだ無い/削除済みなら添えない。
 */
function sinceOpen(c: SubscribedChannel): string | null {
  if (!c.channelCreatedAt) return null
  return formatSpan(c.channelCreatedAt, c.subscribedAt)
}

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

      <!--
        集計値。結果画面と同じ 3 枠。
        「最初の登録」のカードは一覧に譲ったので、何の開設日/年数なのかが
        枠の中だけで分かるようラベルを言い切る形にしている。
      -->
      <dl class="mt-6 grid grid-cols-3 items-stretch gap-2">
        <div class="rounded-2xl border border-fg bg-surface px-2 py-3.5 text-center">
          <dt class="text-[9px] text-fg-dim">最古の開設</dt>
          <dd
            v-if="stats.oldest?.channelCreatedAt"
            class="mt-1.5 font-mono text-[13px] leading-none font-medium tabular-nums"
          >
            {{ formatDate(stats.oldest.channelCreatedAt) }}
          </dd>
          <dd v-else class="mt-1.5 font-round text-[19px] leading-none font-bold">—</dd>
        </div>
        <div class="rounded-2xl border border-fg bg-surface px-2 py-3.5 text-center">
          <dt class="text-[9px] text-fg-dim">登録歴</dt>
          <dd class="mt-1.5 font-round text-[19px] leading-none font-bold tabular-nums">
            {{ stats.yearsSinceOldest }}<span class="text-[0.6em] font-medium">年</span>
          </dd>
        </div>
        <div class="rounded-2xl border border-fg bg-surface px-2 py-3.5 text-center">
          <dt class="text-[9px] text-fg-dim">登録チャンネル</dt>
          <dd class="mt-1.5 font-round text-[19px] leading-none font-bold tabular-nums">
            {{ stats.total }}
          </dd>
        </div>
      </dl>

      <!-- 一覧。ここがこのカードの主役なので、残りの高さを全部渡す -->
      <p class="mt-5 mb-1.5 pl-5 font-round text-[11px] font-bold text-fg-dim">
        {{ listLabel }}
      </p>
      <!-- 5 件に満たないときも枠が間延びして見えないよう、中身は縦中央に寄せる -->
      <ol
        class="flex min-h-0 flex-1 flex-col justify-center overflow-hidden rounded-[20px] border-2 border-fg bg-surface px-4 py-1"
      >
        <li
          v-for="c in list"
          :key="c.channelId"
          class="flex items-center gap-3 border-b border-line py-4 last:border-0"
        >
          <img
            v-if="avatars[c.channelId]"
            :src="avatars[c.channelId]"
            alt=""
            class="size-9 shrink-0 rounded-full bg-base object-cover"
          />
          <UserCircleIcon v-else class="size-9 shrink-0 text-fg-faint" />

          <div class="min-w-0 flex-1">
            <p class="truncate text-[12.5px]">{{ c.title }}</p>
            <!--
              登録日を主、開設からの長さを添えにする。
              添えは開設日が取れたときだけ出す(削除済みチャンネルでは出ない)。
            -->
            <div class="mt-1.5 flex items-baseline gap-2">
              <span class="shrink-0 font-mono text-[12px] tabular-nums">
                {{ formatDate(c.subscribedAt) }}
              </span>
              <span
                v-if="sinceOpen(c)"
                class="truncate font-round text-[9px] text-fg-dim"
              >
                開設から{{ sinceOpen(c) }}後
              </span>
            </div>
          </div>
        </li>
      </ol>
    </div>
  </div>
</template>
