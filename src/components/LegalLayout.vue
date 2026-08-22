<script setup lang="ts">
defineProps<{ title: string; updatedAt: string }>()
</script>

<template>
  <!--
    器の幅はフッターと揃える。lg 以上は表題を左の柱に固定し、
    本文は読みやすい行長(max-w-2xl)のまま右に置く。
  -->
  <article class="mx-auto max-w-xl px-6 py-16 lg:max-w-5xl lg:px-10 lg:py-20 xl:max-w-6xl">
    <div class="lg:grid lg:grid-cols-[15rem_1fr] lg:items-start lg:gap-x-12">
      <header class="lg:sticky lg:top-10">
        <RouterLink
          to="/"
          class="text-xs text-fg-faint underline underline-offset-4 transition-colors hover:text-fg-dim"
        >
          戻る
        </RouterLink>
        <h1 class="mt-8 text-xl font-medium lg:mt-7">{{ title }}</h1>
        <p class="mt-2 text-xs text-fg-faint">最終更新: {{ updatedAt }}</p>
      </header>
      <div
        class="legal mt-10 space-y-5 text-sm leading-loose text-fg-dim lg:mt-0 lg:max-w-2xl"
      >
        <slot />
      </div>
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
