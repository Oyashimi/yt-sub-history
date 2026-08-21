<script setup lang="ts">
import GoogleSignInButton from './GoogleSignInButton.vue'
import ChannelRow from './ChannelRow.vue'
import type { SubscribedChannel } from '@/types/youtube'

defineProps<{ configError: string | null; showMock?: boolean }>()
const emit = defineEmits<{ start: []; mock: [] }>()

/**
 * 出力形式を示すためのサンプル。実データではない。
 * 実在のチャンネル名は使わず、明示的なダミー名を置く。
 * 行の見た目が結果画面とずれないよう、描画には ChannelRow をそのまま使う。
 */
const sample: SubscribedChannel[] = [
  { name: 'チャンネル A', at: new Date(2011, 3, 3, 21, 14), open: new Date(2010, 7, 9) },
  { name: 'チャンネル B', at: new Date(2014, 9, 20, 12, 38), open: new Date(2013, 2, 1) },
  { name: 'チャンネル C', at: new Date(2018, 5, 2, 8, 5), open: new Date(2018, 3, 17) },
  { name: 'チャンネル D', at: new Date(2021, 1, 14, 23, 47), open: new Date(2016, 10, 25) },
].map((s, i) => ({
  channelId: `sample-${i}`,
  title: s.name,
  thumbnailUrl: '',
  publishedAt: s.at.toISOString(),
  subscribedAt: s.at,
  channelCreatedAt: s.open,
}))
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
          ※ブラウザとGoogleの間だけで処理されます。
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
      <!-- padding は結果画面の一覧カードに合わせている -->
      <div
        class="rounded-3xl border-2 border-fg bg-surface px-5 py-2 shadow-[5px_5px_0_var(--color-fg)]"
      >
        <ul>
          <ChannelRow
            v-for="(c, i) in sample"
            :key="c.channelId"
            :channel="c"
            :rank="i + 1"
            :linked="false"
          />
        </ul>
      </div>
    </div>
  </section>
</template>
