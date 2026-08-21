<script setup lang="ts">
import GoogleSignInButton from './GoogleSignInButton.vue'
import UserCircleIcon from './UserCircleIcon.vue'
import { formatDate, formatElapsed } from '@/lib/format'

defineProps<{ configError: string | null; showMock?: boolean }>()
const emit = defineEmits<{ start: []; mock: [] }>()

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
</script>

<template>
  <section>
    <div class="mx-auto max-w-xl px-6 pt-20 pb-16 sm:pt-28">
      <!-- 全角 12 文字。どの端末幅でも 1 行に収まるよう vw 連動で詰める -->
      <h1
        class="text-center font-round text-[clamp(1.375rem,6.7vw,2.5rem)] leading-[1.3] font-bold tracking-tight"
      >
        チャンネル登録日チェッカー
      </h1>

      <p class="mx-auto mt-5 max-w-md text-center text-[14px] leading-[2] text-fg-dim">
        チャンネル登録日を一覧で見れます。
      </p>

      <div class="mt-9 text-center">
        <GoogleSignInButton @click="emit('start')" />
      </div>

      <!-- 開発時のみ。ログインせずに結果画面を確認するためのもの -->
      <div v-if="showMock" class="mt-3 text-center">
        <button
          type="button"
          class="text-[11px] text-fg-faint underline underline-offset-4 transition-colors hover:text-fg-dim"
          @click="emit('mock')"
        >
          ダミーデータで表示（開発用）
        </button>
      </div>

      <!-- 権限を渡すか判断する場所なので、安全性の説明はボタン直下に置く -->
      <div
        class="relative mx-auto mt-7 max-w-sm rounded-2xl border border-fg bg-surface px-5 py-4 text-center"
      >
        <!--
          吹き出しの尻尾。45 度回した正方形の 2 辺だけに枠線を付ける。
          背景色で親の上辺を塗り潰す仕組みなので bg は不透明であること。
        -->
        <span
          aria-hidden="true"
          class="absolute -top-[9px] left-1/2 size-4 -translate-x-1/2 rotate-45 border-t border-l border-fg bg-surface"
        />
        <p class="text-[12px] leading-[1.9] text-fg">
          ※データはサーバーに保存されません。<br />
          ※ブラウザと Google の間だけで処理されます。
        </p>
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
    </div>
  </section>
</template>
