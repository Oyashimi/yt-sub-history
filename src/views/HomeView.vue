<script setup lang="ts">
import { ref } from 'vue'
import GoogleSignInButton from '@/components/GoogleSignInButton.vue'
import { useAuth } from '@/composables/useAuth'
import { useSubscriptions } from '@/composables/useSubscriptions'
import { formatDate, formatElapsed } from '@/lib/format'
import { isAppError, messageFor } from '@/lib/errors'

const { signIn, signOut } = useAuth()
const { visibleChannels, stats, status, errorKind, progress, truncated, load, reset } =
  useSubscriptions()

const detail = ref<string | null>(null)

async function start() {
  detail.value = null
  try {
    const token = await signIn()
    await load(token)
  } catch (e) {
    if (status.value !== 'error') {
      status.value = 'error'
      errorKind.value = isAppError(e) ? e.kind : 'unknown'
    }
    if (isAppError(e) && e.kind === 'unknown') detail.value = e.message
  }
}

function logout() {
  signOut()
  reset()
}
</script>

<template>
  <main class="mx-auto max-w-2xl px-5 py-16">
    <!-- ランディング -->
    <section v-if="status === 'idle'" class="text-center">
      <h1 class="text-3xl font-black">その推し、何年前から登録してた?</h1>
      <p class="mt-4 text-sm leading-relaxed text-cream/70">
        YouTube の登録チャンネルを「登録した日」順に並べ替えます。
      </p>
      <div class="mt-8 flex justify-center">
        <GoogleSignInButton @click="start" />
      </div>
      <p class="mt-6 text-xs text-cream/50">
        データはサーバーに保存されません（ブラウザと Google の間で完結します）。
      </p>
    </section>

    <!-- 取得中 -->
    <section v-else-if="status === 'loading'" class="text-center">
      <div
        class="mx-auto size-12 animate-spin rounded-full border-4 border-ink-line border-t-gold"
        role="status"
        aria-label="読み込み中"
      />
      <p class="mt-6 text-sm text-cream/60">
        {{ progress.loaded }} 件取得済み<span v-if="progress.total">
          / 全 {{ progress.total }} 件</span
        >
      </p>
    </section>

    <!-- エラー -->
    <section v-else-if="status === 'error'" class="text-center">
      <h2 class="text-xl font-black">{{ messageFor(errorKind ?? 'unknown').title }}</h2>
      <p class="mt-3 text-sm text-cream/65">{{ messageFor(errorKind ?? 'unknown').body }}</p>
      <p v-if="detail" class="mt-3 text-xs text-cream/40">{{ detail }}</p>
      <button
        type="button"
        class="mt-8 rounded-full border border-ink-line px-6 py-3 text-sm font-bold text-cream/80 transition hover:text-cream"
        @click="reset"
      >
        トップに戻る
      </button>
    </section>

    <!-- 結果 -->
    <section v-else>
      <header class="flex items-center justify-between gap-4">
        <h1 class="text-xl font-black">登録チャンネル {{ stats.total }} 件</h1>
        <button
          type="button"
          class="shrink-0 rounded-full border border-ink-line px-4 py-2 text-xs font-bold text-cream/60 transition hover:text-cream"
          @click="logout"
        >
          ログアウト
        </button>
      </header>

      <p v-if="truncated" class="mt-4 text-xs text-gold">
        登録数が多いため、古い順に 1,000 件までを表示しています。
      </p>

      <p v-if="stats.total === 0" class="mt-10 text-center text-sm text-cream/60">
        登録チャンネルが見つかりませんでした。
      </p>

      <ul v-else class="mt-6 space-y-2">
        <li
          v-for="c in visibleChannels"
          :key="c.channelId"
          class="flex items-center gap-3 rounded-xl border border-ink-line bg-ink-soft/60 px-3 py-2.5"
        >
          <img
            :src="c.thumbnailUrl"
            alt=""
            loading="lazy"
            referrerpolicy="no-referrer"
            class="size-10 shrink-0 rounded-full bg-ink-line object-cover"
          />
          <div class="min-w-0 flex-1">
            <a
              :href="`https://www.youtube.com/channel/${c.channelId}`"
              target="_blank"
              rel="noopener noreferrer"
              class="block truncate text-sm font-bold hover:underline"
              >{{ c.title }}</a
            >
            <p class="mt-0.5 text-xs text-cream/50">
              {{ formatDate(c.subscribedAt) }} ・ {{ formatElapsed(c.subscribedAt) }}
            </p>
          </div>
        </li>
      </ul>
    </section>
  </main>
</template>
