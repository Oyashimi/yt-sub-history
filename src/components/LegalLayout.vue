<script setup lang="ts">
defineProps<{ title: string; updatedAt: string }>()
</script>

<template>
  <article class="mx-auto max-w-2xl px-5 py-14">
    <RouterLink to="/" class="text-xs text-cream/50 hover:text-cream">← トップへ戻る</RouterLink>
    <h1 class="mt-4 text-3xl font-black">{{ title }}</h1>
    <p class="mt-2 text-xs text-cream/45">最終更新: {{ updatedAt }}</p>
    <div class="legal mt-8 space-y-6 text-sm leading-relaxed text-cream/75">
      <slot />
    </div>
  </article>
</template>

<style scoped>
.legal :deep(h2) {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--color-cream);
  margin-top: 2rem;
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
}
.legal :deep(a:hover) {
  color: var(--color-cream);
}
</style>
