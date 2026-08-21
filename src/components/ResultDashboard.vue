<script setup lang="ts">
import HighlightStats from './HighlightStats.vue'
import YearChart from './YearChart.vue'
import ChannelRow from './ChannelRow.vue'
import { useSubscriptions } from '@/composables/useSubscriptions'
import { MAX_PAGES, PAGE_SIZE } from '@/lib/youtube'

const emit = defineEmits<{ logout: [] }>()

const { visibleChannels, stats, sortOrder, keyword, truncated } = useSubscriptions()
</script>

<template>
  <section class="mx-auto max-w-3xl px-5 py-10">
    <!-- 空状態 -->
    <div v-if="stats.total === 0" class="py-20 text-center">
      <p class="text-5xl">🫧</p>
      <h2 class="mt-5 text-2xl font-black">登録チャンネルが見つかりませんでした</h2>
      <p class="mt-3 text-sm leading-relaxed text-cream/65">
        別の Google アカウントでログインしているかもしれません。<br />
        ログアウトして、YouTube を使っているアカウントで試してみてください。
      </p>
      <button
        type="button"
        class="mt-8 rounded-full border border-ink-line px-6 py-3 text-sm font-bold text-cream/80 transition hover:text-cream"
        @click="emit('logout')"
      >
        ログアウトしてやり直す
      </button>
    </div>

    <template v-else>
      <header class="flex items-start justify-between gap-4">
        <h1 class="text-2xl font-black">あなたの登録履歴</h1>
        <button
          type="button"
          class="shrink-0 rounded-full border border-ink-line px-4 py-2 text-xs font-bold text-cream/60 transition hover:text-cream"
          @click="emit('logout')"
        >
          ログアウト
        </button>
      </header>

      <div class="mt-6">
        <HighlightStats :stats="stats" />
      </div>

      <div class="mt-4">
        <YearChart :buckets="stats.byYear" />
      </div>

      <p
        v-if="truncated"
        class="mt-4 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-xs leading-relaxed text-gold"
      >
        登録チャンネルが非常に多いため、古い順に {{ MAX_PAGES * PAGE_SIZE }} 件までを
        表示しています。
      </p>

      <!-- 一覧 -->
      <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="inline-flex rounded-full border border-ink-line p-1 text-xs font-bold">
          <button
            type="button"
            class="rounded-full px-4 py-1.5 transition"
            :class="sortOrder === 'oldest' ? 'bg-cream text-ink' : 'text-cream/60'"
            @click="sortOrder = 'oldest'"
          >
            古い順
          </button>
          <button
            type="button"
            class="rounded-full px-4 py-1.5 transition"
            :class="sortOrder === 'newest' ? 'bg-cream text-ink' : 'text-cream/60'"
            @click="sortOrder = 'newest'"
          >
            新しい順
          </button>
        </div>
        <input
          v-model="keyword"
          type="search"
          placeholder="チャンネル名で絞り込む"
          class="w-full rounded-full border border-ink-line bg-ink-soft/70 px-4 py-2 text-sm outline-none transition placeholder:text-cream/35 focus:border-cream/40 sm:w-64"
        />
      </div>

      <p class="mt-3 text-xs text-cream/45">{{ visibleChannels.length }} 件を表示中</p>

      <ul class="mt-3 space-y-2">
        <ChannelRow
          v-for="(c, i) in visibleChannels"
          :key="c.channelId"
          :channel="c"
          :rank="i + 1"
        />
      </ul>

      <p class="mt-8 text-center text-xs leading-relaxed text-cream/40">
        登録日は YouTube API が返す値です。ごく初期の登録では日時が実際とずれる場合があるため、参考値としてご覧ください。
      </p>
    </template>
  </section>
</template>
