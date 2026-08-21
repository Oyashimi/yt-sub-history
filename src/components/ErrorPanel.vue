<script setup lang="ts">
import { computed } from 'vue'
import { messageFor, type AppErrorKind } from '@/lib/errors'

const props = defineProps<{ kind: AppErrorKind; detail?: string | null }>()
const emit = defineEmits<{ retry: []; back: [] }>()

const msg = computed(() => messageFor(props.kind))
const emoji = computed(() => (props.kind === 'quotaExceeded' ? '🍵' : '⚠️'))
</script>

<template>
  <section class="mx-auto max-w-md px-5 py-24 text-center">
    <p class="text-5xl">{{ emoji }}</p>
    <h2 class="mt-5 text-2xl font-black">{{ msg.title }}</h2>
    <p class="mt-3 text-sm leading-relaxed text-cream/65">{{ msg.body }}</p>
    <p v-if="detail" class="mt-3 text-xs text-cream/40">{{ detail }}</p>

    <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
      <button
        v-if="kind !== 'quotaExceeded'"
        type="button"
        class="rounded-full bg-cream px-6 py-3 text-sm font-bold text-ink transition hover:-translate-y-0.5"
        @click="emit('retry')"
      >
        もう一度試す
      </button>
      <button
        type="button"
        class="rounded-full border border-ink-line px-6 py-3 text-sm font-bold text-cream/80 transition hover:border-cream/40 hover:text-cream"
        @click="emit('back')"
      >
        トップに戻る
      </button>
    </div>
  </section>
</template>
