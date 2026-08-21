<script setup lang="ts">
import { computed, ref } from 'vue'
import HighlightStats from './HighlightStats.vue'
import YearChart from './YearChart.vue'
import ChannelRow from './ChannelRow.vue'
import ShareCardModal from './ShareCardModal.vue'
import { useSubscriptions } from '@/composables/useSubscriptions'
import { MAX_PAGES, PAGE_SIZE } from '@/lib/youtube'

const emit = defineEmits<{ logout: [] }>()

const { channels, visibleChannels, stats, sortOrder, keyword, truncated } =
  useSubscriptions()

const showShare = ref(false)
const top5 = computed(() =>
  [...channels.value]
    .sort((a, b) => a.subscribedAt.getTime() - b.subscribedAt.getTime())
    .slice(0, 5),
)
</script>

<template>
  <section class="mx-auto max-w-xl px-6 py-16">
    <!-- 空状態 -->
    <div v-if="stats.total === 0">
      <h2 class="text-base font-medium">登録チャンネルが見つかりませんでした</h2>
      <p class="mt-3 text-sm leading-loose text-fg-dim">
        別の Google アカウントでログインしている可能性があります。
      </p>
      <button
        type="button"
        class="mt-8 border border-line bg-surface px-5 py-2.5 text-sm transition-colors hover:border-fg-faint"
        @click="emit('logout')"
      >
        ログアウト
      </button>
    </div>

    <template v-else>
      <header class="flex items-baseline justify-between gap-4">
        <h1 class="text-xs text-fg-dim">登録チャンネル</h1>
        <button
          type="button"
          class="shrink-0 text-xs text-fg-faint underline underline-offset-4 transition-colors hover:text-fg"
          @click="emit('logout')"
        >
          ログアウト
        </button>
      </header>

      <div class="mt-6">
        <HighlightStats :stats="stats" />
      </div>

      <div class="mt-12">
        <YearChart :buckets="stats.byYear" />
      </div>

      <div class="mt-12">
        <button
          type="button"
          class="border border-line bg-surface px-5 py-2.5 text-sm transition-colors hover:border-fg-faint"
          @click="showShare = true"
        >
          画像を書き出す
        </button>
      </div>

      <p v-if="truncated" class="mt-8 text-xs leading-loose text-fg-dim">
        登録数が多いため、古い順に {{ MAX_PAGES * PAGE_SIZE }} 件までを表示しています。
      </p>

      <!-- 一覧 -->
      <div class="mt-16 flex items-center justify-between gap-4 border-b border-line pb-3">
        <div class="flex items-center gap-4 text-xs">
          <button
            type="button"
            class="transition-colors"
            :class="sortOrder === 'oldest' ? 'text-fg' : 'text-fg-faint hover:text-fg-dim'"
            @click="sortOrder = 'oldest'"
          >
            古い順
          </button>
          <button
            type="button"
            class="transition-colors"
            :class="sortOrder === 'newest' ? 'text-fg' : 'text-fg-faint hover:text-fg-dim'"
            @click="sortOrder = 'newest'"
          >
            新しい順
          </button>
        </div>
        <input
          v-model="keyword"
          type="search"
          placeholder="絞り込む"
          class="w-32 border-b border-line bg-transparent pb-1 text-xs outline-none transition-colors placeholder:text-fg-faint focus:border-fg-dim sm:w-40"
        />
      </div>

      <ul>
        <ChannelRow
          v-for="(c, i) in visibleChannels"
          :key="c.channelId"
          :channel="c"
          :rank="i + 1"
        />
      </ul>

      <p class="mt-10 text-xs leading-loose text-fg-faint">
        登録日は YouTube API が返す値です。初期の登録では実際の日時とずれる場合があります。
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
