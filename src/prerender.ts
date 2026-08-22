import { createSSRApp, h } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { renderToString } from 'vue/server-renderer'
import App from './App.vue'
import PrivacyView from './views/PrivacyView.vue'
import TermsView from './views/TermsView.vue'

/**
 * ビルド時に静的 HTML を書き出すページ。
 *
 * 配信は SPA フォールバック(/* -> /index.html)なので、JS を実行しない相手には
 * /privacy も /terms もトップページと同じ HTML に見える。Google の OAuth
 * ブランディング確認はクローラーが HTML を読むだけなので、それだとポリシー本文が
 * 存在しない扱いになる。ここで実際の Vue コンポーネントを HTML にして置く。
 *
 * 本文は src/views/*.vue を描画して作るため、ポリシーの二重管理は起きない。
 */
export const pages = [
  {
    route: '/privacy',
    out: 'privacy/index.html',
    title: 'プライバシーポリシー — チャンネル登録日チェッカー',
    description:
      'チャンネル登録日チェッカーのプライバシーポリシー。本サービスは利用者のチャンネル登録データを収集・送信・保存しません。要求する権限は youtube.readonly(読み取り専用)のみです。',
  },
  {
    route: '/terms',
    out: 'terms/index.html',
    title: '利用規約 — チャンネル登録日チェッカー',
    description:
      'チャンネル登録日チェッカーの利用規約。本サービスは YouTube のチャンネル登録情報を利用者自身のブラウザ上で可視化する無料のツールです。',
  },
]

/** ルート定義は main.ts と同じ path を使う。RouterLink の href 解決に必要 */
function createSsrRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      // トップは描画しない(ブラウザ API に依存するため)。href 解決用のプレースホルダ
      { path: '/', name: 'home', component: { render: () => h('div') } },
      { path: '/privacy', name: 'privacy', component: PrivacyView },
      { path: '/terms', name: 'terms', component: TermsView },
    ],
  })
}

/** route を描画して #app の中身になる HTML を返す */
export async function render(route: string): Promise<string> {
  const app = createSSRApp(App)
  const router = createSsrRouter()
  app.use(router)
  await router.push(route)
  await router.isReady()
  return renderToString(app)
}
