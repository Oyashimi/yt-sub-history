<script setup lang="ts">
import { computed } from 'vue'
import { formatDate, elapsedYears } from '@/lib/format'
import { veteranTitle, type Stats } from '@/lib/stats'
import { hueFromString } from '@/lib/image'
import type { SubscribedChannel } from '@/types/youtube'

const props = defineProps<{
  stats: Stats
  top5: SubscribedChannel[]
  /** channelId → data URL(取得できたものだけ) */
  avatars: Record<string, string>
}>()

const title = computed(() => veteranTitle(props.stats.veteranYears))
const initial = (name: string) => Array.from(name.trim())[0] ?? '?'
</script>

<template>
  <!-- 9:16。html-to-image で pixelRatio を上げて書き出す前提の CSS サイズ -->
  <div
    class="relative flex h-[640px] w-90 shrink-0 flex-col overflow-hidden px-6 py-7 text-cream"
    style="
      background:
        radial-gradient(28rem 20rem at 0% -8%, rgba(255, 47, 70, 0.28), transparent 62%),
        radial-gradient(24rem 18rem at 108% 4%, rgba(245, 196, 81, 0.26), transparent 62%),
        #0b0b10;
    "
  >
    <header>
      <p class="text-[10px] font-bold tracking-[0.22em] text-gold/85">
        YOUTUBE VETERAN CHECK
      </p>
      <p class="mt-3 text-[26px] font-black leading-tight">
        {{ title.emoji }} {{ title.label }}
      </p>
      <p class="mt-1 text-[40px] font-black leading-none text-gradient-gold">
        YouTube 歴 {{ stats.veteranYears }} 年
      </p>
    </header>

    <div class="mt-5 grid grid-cols-3 gap-2 text-center">
      <div class="rounded-xl border border-white/10 bg-white/[0.06] py-2">
        <p class="text-[9px] text-cream/55">登録数</p>
        <p class="text-lg font-black tabular-nums">{{ stats.total }}</p>
      </div>
      <div class="rounded-xl border border-white/10 bg-white/[0.06] py-2">
        <p class="text-[9px] text-cream/55">10年超</p>
        <p class="text-lg font-black tabular-nums">{{ stats.overTenYears.length }}</p>
      </div>
      <div class="rounded-xl border border-white/10 bg-white/[0.06] py-2">
        <p class="text-[9px] text-cream/55">5年超</p>
        <p class="text-lg font-black tabular-nums">{{ stats.overFiveYears.length }}</p>
      </div>
    </div>

    <p class="mt-6 text-[11px] font-bold tracking-wide text-gold/80">最古参 TOP 5</p>
    <ol class="mt-2 flex-1 space-y-2">
      <li
        v-for="(c, i) in top5"
        :key="c.channelId"
        class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2"
      >
        <span class="w-4 text-center text-[13px] font-black text-gold/85">{{ i + 1 }}</span>
        <img
          v-if="avatars[c.channelId]"
          :src="avatars[c.channelId]"
          alt=""
          class="size-9 shrink-0 rounded-full object-cover"
        />
        <span
          v-else
          class="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-black text-ink"
          :style="{ background: `hsl(${hueFromString(c.title)} 70% 68%)` }"
        >
          {{ initial(c.title) }}
        </span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-[13px] font-bold leading-tight">{{ c.title }}</span>
          <span class="block text-[10px] tabular-nums text-cream/55">
            {{ formatDate(c.subscribedAt) }} ・ {{ elapsedYears(c.subscribedAt) }}年目
          </span>
        </span>
      </li>
    </ol>

    <footer class="mt-4 border-t border-white/10 pt-3 text-[10px] text-cream/45">
      #YouTube古参チェッカー ／ 古参チェッカーで診断
    </footer>
  </div>
</template>
