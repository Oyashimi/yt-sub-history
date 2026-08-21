<script setup lang="ts">
import GoogleSignInButton from './GoogleSignInButton.vue'
import UserCircleIcon from './UserCircleIcon.vue'
import { formatDate, formatElapsed } from '@/lib/format'

defineProps<{ configError: string | null }>()
const emit = defineEmits<{ start: [] }>()

/**
 * 出力形式を示すためのサンプル。実データではない。
 * 実在のチャンネル名は使わず、明示的なダミー名を置く。
 */
const sample = [
  { name: 'チャンネル A', date: new Date(2011, 3, 3) },
  { name: 'チャンネル B', date: new Date(2014, 9, 20) },
  { name: 'チャンネル C', date: new Date(2018, 5, 2) },
  { name: 'チャンネル D', date: new Date(2021, 1, 14) },
]

const notes = [
  {
    label: 'データ',
    body: 'このサイトにサーバーはありません。チャンネル登録の情報はブラウザと Google の間だけでやり取りされ、運営者を含む第三者が受け取ることはありません。',
  },
  {
    label: '注意',
    body: '取得できるのは古い順に 1,000 件までです。登録日は YouTube API が返す値のため、初期の登録では実際とずれる場合があります。',
  },
]
</script>

<template>
  <section>
    <div class="mx-auto max-w-xl px-6 pt-20 pb-16 sm:pt-28">
      <!-- 全角 12 文字。どの端末幅でも 1 行に収まるよう vw 連動で詰める -->
      <h1
        class="text-center font-round text-[clamp(1.375rem,6.7vw,2.5rem)] leading-[1.3] font-bold tracking-tight"
      >
        チャンネル<wbr />登録日チェッカー
      </h1>

      <p class="mx-auto mt-5 max-w-md text-center text-[14px] leading-[2] text-fg-dim">
        チャンネル登録日を一覧で見れます。
      </p>

      <div class="mt-9 text-center">
        <GoogleSignInButton @click="emit('start')" />
      </div>

      <p
        v-if="configError"
        class="mt-6 rounded-xl border-2 border-fg bg-pink/15 px-4 py-3 text-[13px] leading-relaxed"
      >
        {{ configError }}
      </p>

      <!-- 表示例(チケット風) -->
      <!-- 左の余白 pl-6 はカードの角丸 24px と内側パディングに合わせている -->
      <p class="mt-16 mb-1.5 pl-6 font-round text-[12px] font-bold text-fg-dim">表示例</p>
      <div
        class="rounded-3xl border-2 border-fg bg-surface px-6 py-4 shadow-[5px_5px_0_var(--color-fg)]"
      >
        <ul>
          <li
            v-for="s in sample"
            :key="s.date.getTime()"
            class="flex items-center gap-3 border-b border-line py-3 last:border-0"
          >
            <UserCircleIcon class="size-8 shrink-0 text-fg-faint" />
            <span class="min-w-0 flex-1 truncate text-[13px] text-fg-dim">
              {{ s.name }}
            </span>
            <span class="shrink-0 text-right">
              <span class="block font-mono text-[13px] tabular-nums">
                {{ formatDate(s.date) }}
              </span>
              <span class="mt-0.5 block font-round text-[11px] text-fg-dim">
                {{ formatElapsed(s.date) }}
              </span>
            </span>
          </li>
        </ul>

        <p class="mt-5 text-[11px] leading-relaxed text-fg-faint">
          実際のデータではありません。ログインすると、あなたの登録チャンネルがこの形式で並びます。
        </p>
      </div>

      <!-- 注記 -->
      <dl class="mt-10 space-y-3">
        <div
          v-for="n in notes"
          :key="n.label"
          class="rounded-2xl border-2 border-line bg-surface/60 px-5 py-4"
        >
          <dt class="font-round text-[12px] font-bold">{{ n.label }}</dt>
          <dd class="mt-2 text-[12px] leading-[1.95] text-fg-dim">{{ n.body }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>
