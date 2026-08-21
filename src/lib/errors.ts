export type AppErrorKind =
  | 'unauthorized' // 401: トークン失効
  | 'quotaExceeded' // 403 quotaExceeded: 本日分の上限
  | 'forbidden' // その他 403
  | 'network' // 通信断
  | 'unknown'

export class AppError extends Error {
  readonly kind: AppErrorKind

  constructor(kind: AppErrorKind, message: string) {
    super(message)
    this.name = 'AppError'
    this.kind = kind
  }
}

export function isAppError(e: unknown): e is AppError {
  return e instanceof AppError
}

/** ユーザーに見せる日本語メッセージ */
export function messageFor(kind: AppErrorKind): { title: string; body: string } {
  switch (kind) {
    case 'unauthorized':
      return {
        title: 'ログインの有効期限が切れました',
        body: 'アクセストークンの有効期限は約 1 時間です。もう一度ログインしてください。',
      }
    case 'quotaExceeded':
      return {
        title: '本日分の利用上限に達しました',
        body: 'YouTube API の 1 日あたりの上限に達しています。上限は毎日 17:00(日本時間)ごろにリセットされます。時間をおいてお試しください。',
      }
    case 'forbidden':
      return {
        title: 'データを取得できませんでした',
        body: 'YouTube 側の設定でチャンネル登録情報が取得できない可能性があります。時間をおいて試してください。',
      }
    case 'network':
      return {
        title: '通信に失敗しました',
        body: 'ネットワーク接続を確認して、もう一度お試しください。',
      }
    default:
      return {
        title: '予期しないエラーが発生しました',
        body: 'お手数ですが、ページを再読み込みしてもう一度お試しください。',
      }
  }
}
