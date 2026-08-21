<template>
  <footer class="mt-24 border-t border-line">
    <div class="mx-auto max-w-xl space-y-4 px-6 py-10 text-[11px] leading-loose text-fg-faint">
      <nav class="flex flex-wrap gap-x-5 gap-y-1">
        <RouterLink to="/" class="transition-colors hover:text-fg-dim">ホーム</RouterLink>
        <RouterLink to="/privacy" class="transition-colors hover:text-fg-dim">
          プライバシーポリシー
        </RouterLink>
        <RouterLink to="/terms" class="transition-colors hover:text-fg-dim">
          利用規約
        </RouterLink>
      </nav>
      <p>
        本サービスは YouTube API Services を利用しています。ご利用にあたっては
        <a
          href="https://www.youtube.com/t/terms"
          target="_blank"
          rel="noopener noreferrer"
          class="underline underline-offset-2 hover:text-fg-dim"
          >YouTube 利用規約</a
        >
        および
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          class="underline underline-offset-2 hover:text-fg-dim"
          >Google プライバシーポリシー</a
        >
        が適用されます。
      </p>
    </div>
  </footer>
</template>
