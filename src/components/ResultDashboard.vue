<script setup lang="ts">
import { computed, ref } from 'vue'
import HighlightStats from './HighlightStats.vue'
import YearChart from './YearChart.vue'
import ChannelRow from './ChannelRow.vue'
import ShareCardModal from './ShareCardModal.vue'
import FilterPanel from './FilterPanel.vue'
import { defaultAxisFilter, useSubscriptions } from '@/composables/useSubscriptions'
import { elapsedYears } from '@/lib/format'

const emit = defineEmits<{ logout: [] }>()

const {
  channels,
  visibleChannels,
  isFuzzyMatch,
  stats,
  sortOrder,
  keyword,
  yearFilter,
  spanFilter,
} = useSubscriptions()

const years = computed(() => stats.value.byYear.map((b) => b.year))

/** 登録期間の選択肢。最も新しい登録から最も古い登録までの年数 */
const spans = computed(() => {
  const { newest, yearsSinceOldest } = stats.value
  if (!newest) return []
  const min = elapsedYears(newest.subscribedAt)
  return Array.from({ length: yearsSinceOldest - min + 1 }, (_, i) => min + i)
})

/** 年グラフのクリックは登録年フィルタへの近道。その年だけの範囲を張る */
function toggleYear(year: number) {
  const f = yearFilter.value
  const isJustThisYear = f.mode === 'range' && f.a === year && f.b === year
  yearFilter.value = isJustThisYear
    ? defaultAxisFilter()
    : { mode: 'range', a: year, b: year }
}

const showShare = ref(false)

/** 書き出し画像に載せる 5 件。一覧の並び順とは独立させ、古い順で固定する */
const shareList = computed(() =>
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
        <YearChart
          :buckets="stats.byYear"
          :filter="yearFilter"
          @select="toggleYear"
        />
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

      <!-- 絞り込みと検索。一覧カードの外に置く -->
      <div class="mt-14">
        <FilterPanel
          v-model:year="yearFilter"
          v-model:span="spanFilter"
          v-model:keyword="keyword"
          :years="years"
          :spans="spans"
        />
      </div>

      <!-- 一覧 -->
      <!-- 左右とも px-6 はカードの角丸 24px に合わせている -->
      <div class="mt-10 mb-1.5 flex items-baseline justify-between gap-3 px-6">
        <p class="font-round text-[12px] font-bold text-fg-dim">
          ヒット数
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
        class="rounded-3xl border-2 border-fg bg-surface px-5 py-2"
      >
        <p v-if="isFuzzyMatch" class="border-b border-line py-2.5 text-[11px] text-fg-faint">
          ※完全に一致する名前がないため、近いものを表示しています。
        </p>

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
      :list="shareList"
      @close="showShare = false"
    />
  </section>
</template>
