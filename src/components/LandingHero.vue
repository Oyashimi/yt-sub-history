<script setup lang="ts">
import GoogleSignInButton from './GoogleSignInButton.vue'

defineProps<{ configError: string | null }>()
const emit = defineEmits<{ start: [] }>()
</script>

<template>
  <section class="mx-auto max-w-xl px-6 pt-28 pb-16 sm:pt-40">
    <h1 class="text-2xl leading-snug font-medium tracking-tight sm:text-3xl">
      登録チャンネルを、登録した日順に。
    </h1>

    <p class="mt-5 text-sm leading-loose text-fg-dim">
      YouTube のチャンネル登録を古い順に並べ替えて表示します。<br />
      いつ登録したかは、YouTube 上では確認できません。
    </p>

    <div class="mt-10">
      <GoogleSignInButton @click="emit('start')" />
    </div>

    <p
      v-if="configError"
      class="mt-6 border-l border-fg-dim pl-3 text-sm leading-relaxed text-fg-dim"
    >
      {{ configError }}
    </p>

    <dl class="mt-20 space-y-5 border-t border-line pt-8 text-xs leading-loose">
      <div>
        <dt class="text-fg">データは保存されません</dt>
        <dd class="mt-1 text-fg-dim">
          このサイトにサーバーはありません。チャンネル登録の情報はブラウザと Google
          の間だけでやり取りされ、運営者を含む第三者が受け取ることはありません。
        </dd>
      </div>
      <div>
        <dt class="text-fg">読み取りのみ</dt>
        <dd class="mt-1 text-fg-dim">
          要求する権限は読み取り専用です。チャンネル登録の追加・削除は行いません。アクセス権限は
          Google アカウントの設定からいつでも取り消せます。
        </dd>
      </div>
    </dl>
  </section>
</template>
