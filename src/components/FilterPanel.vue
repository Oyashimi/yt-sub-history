<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import SearchIcon from './SearchIcon.vue'
import {
  axisHit,
  defaultAxisFilter,
  type AxisFilter,
  type RangeMode,
} from '@/composables/useSubscriptions'

const props = defineProps<{
  /** 選べる登録年(昇順) */
  years: number[]
  /** 選べる登録期間(年数・昇順) */
  spans: number[]
}>()

const yearFilter = defineModel<AxisFilter>('year', { required: true })
const spanFilter = defineModel<AxisFilter>('span', { required: true })
const keyword = defineModel<string>('keyword', { required: true })

const MODES: Array<{ mode: RangeMode; label: string }> = [
  { mode: 'lte', label: '以下' },
  { mode: 'gte', label: '以上' },
  { mode: 'range', label: '範囲' },
]

type Axis = 'year' | 'span'
const modelOf = (axis: Axis) => (axis === 'year' ? yearFilter : spanFilter)

/** モードを変えても選択済みの始点は引き継ぐ。範囲以外では終点を捨てる */
function setMode(axis: Axis, mode: RangeMode) {
  const m = modelOf(axis)
  m.value = { mode, a: m.value.a, b: mode === 'range' ? m.value.b : null }
}

function setValue(axis: Axis, key: 'a' | 'b', v: number | null) {
  const m = modelOf(axis)
  m.value = { ...m.value, [key]: v }
}

const anyActive = computed(
  () => axisHit(yearFilter.value, 0) !== null || axisHit(spanFilter.value, 0) !== null,
)

function clearAll() {
  yearFilter.value = defaultAxisFilter()
  spanFilter.value = defaultAxisFilter()
}

const searchInput = useTemplateRef<HTMLInputElement>('searchInput')

const axes = computed(() => [
  { key: 'year' as const, label: '登録年', values: props.years, model: yearFilter.value },
  { key: 'span' as const, label: '登録期間', values: props.spans, model: spanFilter.value },
])
</script>

<template>
  <section>
    <div class="mb-1.5 flex items-baseline justify-between gap-3 px-6">
      <p class="font-round text-[12px] font-bold text-fg-dim">絞り込み</p>
      <button
        v-if="anyActive"
        type="button"
        class="font-round text-[11px] text-fg-faint underline underline-offset-4 transition-colors hover:text-fg"
        @click="clearAll"
      >
        すべて解除
      </button>
    </div>

    <div class="rounded-3xl border-2 border-fg bg-surface px-5 py-1">
      <div v-for="ax in axes" :key="ax.key" class="border-b border-line py-3.5">
        <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span class="font-round text-[11px] font-bold">{{ ax.label }}</span>

          <span class="flex items-center gap-2.5">
            <button
              v-for="m in MODES"
              :key="m.mode"
              type="button"
              class="font-round text-[11px] transition-colors"
              :class="
                ax.model.mode === m.mode
                  ? 'font-bold text-fg underline underline-offset-4'
                  : 'text-fg-faint hover:text-fg-dim'
              "
              @click="setMode(ax.key, m.mode)"
            >
              {{ m.label }}
            </button>
          </span>

          <!-- 値。始点は全モード共通、終点は範囲のときだけ出す -->
          <span class="ml-auto flex items-center gap-1.5">
            <span class="relative inline-flex items-center">
              <select
                :value="ax.model.a"
                :aria-label="`${ax.label}の${ax.model.mode === 'range' ? '始点' : '基準'}`"
                class="appearance-none rounded-md border border-fg bg-surface py-0.5 pr-5 pl-2 font-mono text-[11px] tabular-nums outline-none"
                @change="
                  setValue(
                    ax.key,
                    'a',
                    ($event.target as HTMLSelectElement).value === ''
                      ? null
                      : Number(($event.target as HTMLSelectElement).value),
                  )
                "
              >
                <option value="">指定なし</option>
                <option v-for="v in ax.values" :key="v" :value="v">{{ v }}年</option>
              </select>
              <span
                aria-hidden="true"
                class="pointer-events-none absolute right-1.5 text-[8px] text-fg-dim"
              >
                ▼
              </span>
            </span>

            <template v-if="ax.model.mode === 'range'">
              <span class="font-round text-[11px] text-fg-dim">〜</span>
              <span class="relative inline-flex items-center">
                <select
                  :value="ax.model.b"
                  :aria-label="`${ax.label}の終点`"
                  class="appearance-none rounded-md border border-fg bg-surface py-0.5 pr-5 pl-2 font-mono text-[11px] tabular-nums outline-none"
                  @change="
                    setValue(
                      ax.key,
                      'b',
                      ($event.target as HTMLSelectElement).value === ''
                        ? null
                        : Number(($event.target as HTMLSelectElement).value),
                    )
                  "
                >
                  <option value="">指定なし</option>
                  <option v-for="v in ax.values" :key="v" :value="v">{{ v }}年</option>
                </select>
                <span
                  aria-hidden="true"
                  class="pointer-events-none absolute right-1.5 text-[8px] text-fg-dim"
                >
                  ▼
                </span>
              </span>
            </template>

            <!-- 範囲以外はモードを接尾辞として添える -->
            <span v-else class="font-round text-[11px] text-fg-dim">
              {{ ax.model.mode === 'gte' ? '以上' : '以下' }}
            </span>
          </span>
        </div>
      </div>

      <!-- 名前 -->
      <div class="cursor-text py-3.5" @click="searchInput?.focus()">
        <label class="flex items-center gap-2">
          <SearchIcon class="size-4 shrink-0 text-fg-faint" />
          <input
            ref="searchInput"
            v-model="keyword"
            type="search"
            placeholder="名前で絞り込む"
            aria-describedby="search-hint"
            class="w-full bg-transparent text-[12px] outline-none placeholder:text-fg-faint"
          />
        </label>
        <p id="search-hint" class="mt-1.5 pl-6 text-[10px] leading-[1.7] text-fg-faint">
          スペースで区切ると複数の言葉を探せます。<span class="inline-block w-1.5" />
          ひらがな・カタカナ、全角・半角はどれでもOK。
        </p>
      </div>
    </div>
  </section>
</template>
