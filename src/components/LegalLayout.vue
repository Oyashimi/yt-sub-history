<script setup lang="ts">
defineProps<{ title: string; updatedAt: string }>()
</script>

<template>
  <article class="mx-auto max-w-xl px-6 py-16">
    <RouterLink
      to="/"
      class="text-xs text-fg-faint underline underline-offset-4 transition-colors hover:text-fg-dim"
    >
      戻る
    </RouterLink>
    <h1 class="mt-8 text-xl font-medium">{{ title }}</h1>
    <p class="mt-2 text-xs text-fg-faint">最終更新: {{ updatedAt }}</p>
    <div class="legal mt-10 space-y-5 text-sm leading-loose text-fg-dim">
      <slot />
    </div>
  </article>
</template>

<style scoped>
.legal :deep(h2) {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-fg);
  margin-top: 2.5rem;
}
.legal :deep(ul) {
  list-style: disc;
  padding-left: 1.25rem;
}
.legal :deep(li) {
  margin-top: 0.35rem;
}
.legal :deep(a) {
  text-decoration: underline;
  text-underline-offset: 2px;
}
.legal :deep(a:hover) {
  color: var(--color-fg);
}
.legal :deep(code) {
  font-size: 0.8125rem;
  color: var(--color-fg);
  word-break: break-all;
}
</style>
