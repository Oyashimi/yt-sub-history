<script setup lang="ts">
import { computed } from 'vue'
import { messageFor, type AppErrorKind } from '@/lib/errors'

const props = defineProps<{ kind: AppErrorKind; detail?: string | null }>()
const emit = defineEmits<{ retry: []; back: [] }>()

const msg = computed(() => messageFor(props.kind))
</script>

<template>
  <section class="mx-auto max-w-xl px-6 pt-40 pb-16">
    <h2 class="text-base font-medium">{{ msg.title }}</h2>
    <p class="mt-3 text-sm leading-loose text-fg-dim">{{ msg.body }}</p>
    <p v-if="detail" class="mt-3 text-xs leading-relaxed text-fg-faint">{{ detail }}</p>

    <div class="mt-10 flex gap-3">
      <button
        v-if="kind !== 'quotaExceeded'"
        type="button"
        class="border border-line bg-surface px-5 py-2.5 text-sm transition-colors hover:border-fg-faint"
        @click="emit('retry')"
      >
        再試行
      </button>
      <button
        type="button"
        class="px-1 py-2.5 text-sm text-fg-dim underline underline-offset-4 transition-colors hover:text-fg"
        @click="emit('back')"
      >
        最初に戻る
      </button>
    </div>
  </section>
</template>
