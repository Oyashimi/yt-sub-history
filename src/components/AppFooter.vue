<template>
  <footer class="border-t border-ink-line/80 mt-20">
    <div
      class="mx-auto max-w-3xl px-5 py-8 text-xs leading-relaxed text-cream/50 space-y-3"
    >
      <nav class="flex flex-wrap gap-x-5 gap-y-2">
        <RouterLink to="/" class="hover:text-cream transition">ホーム</RouterLink>
        <RouterLink to="/privacy" class="hover:text-cream transition"
          >プライバシーポリシー</RouterLink
        >
        <RouterLink to="/terms" class="hover:text-cream transition">利用規約</RouterLink>
      </nav>
      <p>
        本サービスは YouTube API Services を利用しています。ご利用にあたっては
        <a
          href="https://www.youtube.com/t/terms"
          target="_blank"
          rel="noopener noreferrer"
          class="underline hover:text-cream"
          >YouTube 利用規約</a
        >
        および
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          class="underline hover:text-cream"
          >Google プライバシーポリシー</a
        >
        が適用されます。
      </p>
      <p>本サービスは Google および YouTube とは提携していない個人開発の非公式サービスです。</p>
    </div>
  </footer>
</template>
