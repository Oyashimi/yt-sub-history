<template>
  <footer class="mt-24 border-t border-line">
    <!-- 本文と同じ器。lg 以上はリンクを左の柱に立てて、注記を右に流す -->
    <div
      class="mx-auto max-w-xl px-6 py-10 text-[11px] leading-loose text-fg-faint lg:max-w-5xl lg:px-10 lg:py-12 xl:max-w-6xl"
    >
      <div
        class="space-y-4 lg:grid lg:grid-cols-[auto_1fr] lg:gap-x-16 lg:space-y-0 xl:gap-x-24"
      >
        <nav class="flex flex-wrap gap-x-5 gap-y-1 lg:flex-col lg:gap-y-1.5">
          <RouterLink to="/" class="transition-colors hover:text-fg-dim">ホーム</RouterLink>
          <RouterLink to="/privacy" class="transition-colors hover:text-fg-dim">
            プライバシーポリシー
          </RouterLink>
          <RouterLink to="/terms" class="transition-colors hover:text-fg-dim">
            利用規約
          </RouterLink>
        </nav>
        <div class="space-y-4">
          <p>
            本サービスは YouTube API Services を利用しています。<br />
            ご利用にあたっては
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
          <!-- MIT は著作権表示の保持を求めているため、配信物にも出す -->
          <p>
            アイコンは
            <a
              href="https://tabler.io/icons"
              target="_blank"
              rel="noopener noreferrer"
              class="underline underline-offset-2 hover:text-fg-dim"
              >Tabler Icons</a
            >
            （MIT License / © 2020-2026 Paweł Kuna）を使用しています。
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>
