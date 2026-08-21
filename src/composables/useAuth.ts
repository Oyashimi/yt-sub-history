import { ref, shallowRef } from 'vue'
import { AppError } from '@/lib/errors'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
const SCOPE = 'https://www.googleapis.com/auth/youtube.readonly'

/**
 * アクセストークンはこのモジュールスコープの ref にのみ保持する。
 * localStorage / sessionStorage / Cookie には絶対に書かない。
 */
const accessToken = ref<string | null>(null)
const tokenClient = shallowRef<google.accounts.oauth2.TokenClient | null>(null)

/** GIS の script タグ(index.html)が読み込まれるのを待つ */
function waitForGis(timeoutMs = 10_000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof google !== 'undefined' && google.accounts?.oauth2) return resolve()
    const started = performance.now()
    const timer = window.setInterval(() => {
      if (typeof google !== 'undefined' && google.accounts?.oauth2) {
        window.clearInterval(timer)
        resolve()
      } else if (performance.now() - started > timeoutMs) {
        window.clearInterval(timer)
        reject(new AppError('network', 'Google Identity Services の読み込みに失敗しました'))
      }
    }, 50)
  })
}

export function useAuth() {
  /** ログイン(トークン取得)。成功するとアクセストークンを返す */
  async function signIn(): Promise<string> {
    if (!CLIENT_ID) {
      throw new AppError(
        'unknown',
        'VITE_GOOGLE_CLIENT_ID が設定されていません(.env を確認してください)',
      )
    }
    await waitForGis()

    return new Promise<string>((resolve, reject) => {
      tokenClient.value = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPE,
        callback: (res) => {
          if (res.error) {
            reject(new AppError('unauthorized', res.error_description || res.error))
            return
          }
          if (!res.access_token) {
            reject(new AppError('unauthorized', 'アクセストークンを取得できませんでした'))
            return
          }
          accessToken.value = res.access_token
          resolve(res.access_token)
        },
        error_callback: (err) => {
          // ポップアップを閉じた / ブロックされた等
          reject(new AppError('unauthorized', err?.message ?? 'ログインがキャンセルされました'))
        },
      })
      tokenClient.value.requestAccessToken({ prompt: '' })
    })
  }

  /** トークンを失効させてメモリからも消す */
  function signOut() {
    const token = accessToken.value
    accessToken.value = null
    if (token && typeof google !== 'undefined' && google.accounts?.oauth2) {
      google.accounts.oauth2.revoke(token, () => {})
    }
  }

  return { accessToken, signIn, signOut, isConfigured: Boolean(CLIENT_ID) }
}
