# 古参チェッカー（yt-sub-history）

YouTube の登録チャンネルを「登録した日」順に並べ替えるサイト。
**完全クライアント完結**（サーバー・DB なし）で、ユーザーデータは運営インフラを一切通りません。

戦略は [youtube-subscription-timeline-plan.md](./youtube-subscription-timeline-plan.md) を参照。

## 技術スタック

Vue 3 + Vite + TypeScript / Tailwind CSS v4 / Google Identity Services（token model）/
YouTube Data API v3 / Cloudflare Pages

## セットアップ

```bash
npm install
cp .env.example .env   # VITE_GOOGLE_CLIENT_ID を設定
```

### Google Cloud 側

1. GCP プロジェクトを作成し、**YouTube Data API v3** を有効化
2. OAuth 同意画面（External）を設定
   - スコープ: `https://www.googleapis.com/auth/youtube.readonly`（sensitive）
3. OAuth クライアント ID（ウェブアプリケーション）を作成
   - 承認済み JavaScript オリジン: `http://localhost:5173` と本番ドメイン
   - client secret は使いません（token model のため）
4. 発行された client ID を `.env` の `VITE_GOOGLE_CLIENT_ID` に設定

公開前に **OAuth 検証申請** と **クォータ増枠申請** が必要です（計画書 §7 参照）。
未検証の間はテストユーザー（最大 100 人）のみ利用できます。

## コマンド

| コマンド            | 内容                             |
| ------------------- | -------------------------------- |
| `npm run dev`       | 開発サーバー（`localhost:5173`） |
| `npm run build`     | 型チェック + 本番ビルド → `dist` |
| `npm run typecheck` | 型チェックのみ                   |
| `npm run preview`   | ビルド成果物のプレビュー         |

## デプロイ（Cloudflare Pages）

- ビルドコマンド: `npm run build` / 出力ディレクトリ: `dist`
- 環境変数に `VITE_GOOGLE_CLIENT_ID` を設定
- SPA フォールバックは [public/\_redirects](./public/_redirects) で設定済み

## 実装上の禁止事項

- **トークンやユーザーデータを永続化しない**（localStorage / sessionStorage / Cookie 禁止）
- インデントは半角スペース 2 つ、TypeScript strict モード
