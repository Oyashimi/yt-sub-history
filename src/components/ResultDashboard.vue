<script setup lang="ts">
import { computed, ref } from 'vue'
import HighlightStats from './HighlightStats.vue'
import YearChart from './YearChart.vue'
import ChannelRow from './ChannelRow.vue'
import ShareCardModal from './ShareCardModal.vue'
import { useSubscriptions } from '@/composables/useSubscriptions'

const emit = defineEmits<{ logout: [] }>()

const { channels, visibleChannels, stats, sortOrder, keyword } = useSubscriptions()

const showShare = ref(false)
const top5 = computed(() =>
  [...channels.value]
    .sort((a, b) => a.subscribedAt.getTime() - b.subscribedAt.getTime())
    .slice(0, 5),
)
</script>

<template>
  <section class="mx-auto max-w-xl px-6 pt-12 pb-16">
    <!-- 空状態 -->
    <div v-if="stats.total === 0" class="pt-16 text-center">
      <h2 class="font-round text-[18px] font-bold">
        登録チャンネルが見つかりませんでした
      </h2>
      <p class="mt-4 text-[13px] leading-[2] text-fg-dim">
        別の Google アカウントでログインしている可能性があります。
      </p>
      <button
        type="button"
        class="mt-8 rounded-full border-2 border-fg bg-surface px-6 py-3 font-round text-[13px] font-medium shadow-[3px_3px_0_var(--color-fg)] transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_var(--color-fg)]"
        @click="emit('logout')"
      >
        ログアウト
      </button>
    </div>

    <template v-else>
      <header class="mb-8 flex items-baseline justify-between gap-4">
        <h1 class="font-round text-[15px] font-bold">チャンネル登録日チェッカー</h1>
        <button
          type="button"
          class="shrink-0 text-[11px] text-fg-faint underline underline-offset-4 transition-colors hover:text-fg-dim"
          @click="emit('logout')"
        >
          ログアウト
        </button>
      </header>

      <HighlightStats :stats="stats" />

      <div class="mt-10">
        <YearChart :buckets="stats.byYear" />
      </div>

      <div class="mt-8 text-center">
        <button
          type="button"
          class="rounded-full border-2 border-fg bg-surface px-7 py-3.5 font-round text-[14px] font-medium shadow-[4px_4px_0_var(--color-fg)] transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--color-fg)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
          @click="showShare = true"
        >
          画像に書き出す
        </button>
      </div>

      <!-- 一覧 -->
      <!-- 左右とも px-6 はカードの角丸 24px に合わせている -->
      <div class="mt-14 mb-1.5 flex items-baseline justify-between gap-3 px-6">
        <p class="font-round text-[12px] font-bold text-fg-dim">
          すべての登録
          <span class="ml-1 font-mono text-[11px] tabular-nums text-fg-faint">
            {{ visibleChannels.length }}
          </span>
        </p>
        <div class="flex shrink-0 items-center gap-3 font-round text-[11px]">
          <button
            type="button"
            class="transition-colors"
            :class="
              sortOrder === 'oldest'
                ? 'font-bold text-fg underline underline-offset-4'
                : 'text-fg-faint hover:text-fg-dim'
            "
            @click="sortOrder = 'oldest'"
          >
            古い順
          </button>
          <button
            type="button"
            class="transition-colors"
            :class="
              sortOrder === 'newest'
                ? 'font-bold text-fg underline underline-offset-4'
                : 'text-fg-faint hover:text-fg-dim'
            "
            @click="sortOrder = 'newest'"
          >
            新しい順
          </button>
        </div>
      </div>

      <div
        class="rounded-3xl border-2 border-fg bg-surface px-5 py-2 shadow-[5px_5px_0_var(--color-fg)]"
      >
        <div class="border-b border-line py-2.5">
          <input
            v-model="keyword"
            type="search"
            placeholder="チャンネル名で絞り込む"
            class="w-full bg-transparent text-[12px] outline-none placeholder:text-fg-faint"
          />
        </div>

        <p
          v-if="visibleChannels.length === 0"
          class="py-8 text-center text-[12px] text-fg-faint"
        >
          該当するチャンネルがありません。
        </p>

        <ul v-else>
          <ChannelRow
            v-for="(c, i) in visibleChannels"
            :key="c.channelId"
            :channel="c"
            :rank="i + 1"
          />
        </ul>
      </div>

      <p class="mt-6 pl-6 text-[11px] leading-[1.9] text-fg-faint">
        ※登録日は YouTube API が返す値です。初期の登録では実際とずれる場合があります。
      </p>
    </template>

    <ShareCardModal
      v-if="showShare"
      :stats="stats"
      :top5="top5"
      @close="showShare = false"
    />
  </section>
</template>
