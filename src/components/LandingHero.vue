<script setup lang="ts">
import GoogleSignInButton from './GoogleSignInButton.vue'

defineProps<{ configError: string | null }>()
const emit = defineEmits<{ start: [] }>()

const steps = [
  { n: '01', title: 'Google でログイン', body: '読み取り専用の権限だけをリクエストします。' },
  { n: '02', title: '登録チャンネルを解析', body: 'ブラウザが直接 YouTube から取得します。' },
  { n: '03', title: '古参度をシェア', body: 'カード画像を保存して SNS に貼るだけ。' },
]
</script>

<template>
  <section class="mx-auto max-w-3xl px-5 pt-16 pb-10 sm:pt-24 text-center">
    <p
      class="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-bold tracking-wide text-gold"
    >
      🦕 YouTube 古参度チェッカー
    </p>

    <h1 class="mt-6 text-4xl sm:text-6xl font-black leading-tight tracking-tight">
      その推し、<br class="sm:hidden" /><span class="text-gradient-gold">何年前</span
      >から<br />
      登録してた?
    </h1>

    <p class="mt-6 text-base sm:text-lg leading-relaxed text-cream/70">
      YouTube の登録チャンネルを「登録した日」順に並べ替え。<br
        class="hidden sm:block"
      />
      忘れていた最古参チャンネルを掘り起こして、古参マウントを取ろう。
    </p>

    <div class="mt-10 flex flex-col items-center gap-4">
      <GoogleSignInButton @click="emit('start')" />
      <p class="text-xs text-cream/45">Takeout のアップロードは不要。数秒で結果が出ます。</p>
    </div>

    <p
      v-if="configError"
      class="mt-6 rounded-xl border border-flame/40 bg-flame/10 px-4 py-3 text-sm text-flame"
    >
      {{ configError }}
    </p>

    <div
      class="mt-12 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.07] px-5 py-5 text-left"
    >
      <p class="flex items-center gap-2 text-sm font-bold text-emerald-300">
        🔒 データはサーバーに保存されません
      </p>
      <p class="mt-2 text-sm leading-relaxed text-cream/65">
        本サイトにサーバーはありません。チャンネル登録データは
        <strong class="text-cream">あなたのブラウザと Google の間だけ</strong>
        でやり取りされ、運営者を含む第三者が見ることはできません。アクセストークンもメモリ上のみで保持し、タブを閉じた時点で消えます。
      </p>
    </div>

    <ol class="mt-8 grid gap-3 sm:grid-cols-3 text-left">
      <li
        v-for="s in steps"
        :key="s.n"
        class="rounded-2xl border border-ink-line bg-ink-soft/70 px-4 py-4"
      >
        <span class="text-xs font-black text-gold/80">{{ s.n }}</span>
        <p class="mt-1 text-sm font-bold">{{ s.title }}</p>
        <p class="mt-1 text-xs leading-relaxed text-cream/55">{{ s.body }}</p>
      </li>
    </ol>
  </section>
</template>
