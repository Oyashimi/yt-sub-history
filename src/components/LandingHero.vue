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

/** 機能の一覧。README の「できること」と揃えること */
const features = [
  '登録日の古い順・新しい順で並べ替え',
  '最初に登録したチャンネルと、そこからの経過年数',
  '年ごとの登録数をグラフで表示',
  'チャンネル名・登録年・登録期間での絞り込み',
  '結果を画像として書き出し',
]
</script>

<template>
  <section>
    <!--
      器は lg 以上で広げる。ただし名乗りは中央寄せのまま幅を絞り、
      空いた左右は下段(表示例 / このサービスについて)の 2 段組で使う。
    -->
    <div class="mx-auto max-w-xl px-6 pt-20 pb-16 sm:pt-28 lg:max-w-5xl lg:px-10 xl:max-w-6xl">
      <div class="mx-auto max-w-xl">
        <!-- 全角 12 文字。どの端末幅でも 1 行に収まるよう vw 連動で詰める -->
        <h1
          class="text-center font-round text-[clamp(1.375rem,6.7vw,2.5rem)] leading-[1.3] font-bold tracking-tight lg:text-[2.75rem]"
        >
          チャンネル登録日チェッカー
        </h1>

        <!--
          OAuth 同意画面のアプリ名と一致する名前を主語に置き、目的を 1 文で言い切る。
          Google のブランディング確認は「ホームページでアプリの目的が説明されているか」
          を見るため、短縮するときもアプリ名と用途は残すこと。
        -->
        <p class="mx-auto mt-5 max-w-md text-center text-[14px] leading-[2] text-fg-dim">
          チャンネル登録日チェッカーは、YouTube のチャンネルをいつ登録したかを一覧で表示するツールです。
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
      </div>

      <!--
        lg 以上は 2 段組。左に出力の見本、右にサービスの説明を置く。
        高さは揃えず、紙を並べたような不揃いのままにしている。
      -->
      <div class="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-10 xl:gap-x-14">
        <div>
          <!-- 表示例(チケット風) -->
          <!-- 左の余白 pl-6 はカードの角丸 24px と内側パディングに合わせている -->
          <p class="mt-16 mb-1.5 pl-6 font-round text-[12px] font-bold text-fg-dim lg:mt-20">
            表示例
          </p>
          <!-- padding は結果画面の一覧カードに合わせている -->
          <!-- @container は結果画面と同じ。ここは幅が半分なので 2 段組のまま出る -->
          <div
            class="@container rounded-3xl border-2 border-fg bg-surface px-5 py-2 shadow-[5px_5px_0_var(--color-fg)]"
          >
            <ul>
              <ChannelRow
                v-for="c in sample"
                :key="c.channelId"
                :channel="c"
                :linked="false"
              />
            </ul>
          </div>
        </div>

        <div>
          <!--
            Google のブランディング確認が求める「機能の説明」「ユーザーデータを
            要求する目的」「プライバシーポリシーへのリンク」をここで満たしている。
            ファーストビューを変えたくないので、あえてページ下部に置いている。
            位置の要件はなく、ログインせず読めることだけが条件。
          -->
          <p class="mt-16 mb-1.5 pl-6 font-round text-[12px] font-bold text-fg-dim lg:mt-20">
            このサービスについて
          </p>
          <div class="rounded-3xl border-2 border-fg bg-surface px-6 py-5">
            <h2 class="font-round text-[13px] font-bold">できること</h2>
            <ul class="mt-1">
              <li
                v-for="f in features"
                :key="f"
                class="border-b border-line py-2.5 text-[12px] leading-[1.8] text-fg-dim last:border-0"
              >
                {{ f }}
              </li>
            </ul>

            <h2 class="mt-6 font-round text-[13px] font-bold">使用する権限</h2>
            <p class="mt-2 text-[12px] leading-[1.9] text-fg-dim">
              登録チャンネルの一覧と、それぞれの登録日を読み取るためだけに、YouTube
              の読み取り専用の権限（youtube.readonly）を使用します。チャンネル登録の追加・削除はしません。
            </p>

            <h2 class="mt-6 font-round text-[13px] font-bold">データの扱い</h2>
            <p class="mt-2 text-[12px] leading-[1.9] text-fg-dim">
              取得したデータは利用者のブラウザ上でのみ処理され、サーバーには保存されません。運営者を含む第三者が受け取ることはありません。詳しくは
              <RouterLink to="/privacy" class="underline underline-offset-2 hover:text-fg">
                プライバシーポリシー
              </RouterLink>
              と
              <RouterLink to="/terms" class="underline underline-offset-2 hover:text-fg">
                利用規約
              </RouterLink>
              をご覧ください。
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
