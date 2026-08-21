import { AppError } from './errors'
import type {
  SubscribedChannel,
  Subscription,
  SubscriptionListResponse,
  YouTubeApiError,
} from '@/types/youtube'

const ENDPOINT = 'https://www.googleapis.com/youtube/v3/subscriptions'

/** 1 ページ 50 件 × 20 ページ = 最大 1,000 件で打ち切る */
export const MAX_PAGES = 20
export const PAGE_SIZE = 50

export interface FetchProgress {
  /** 取得済み件数 */
  loaded: number
  /** API が申告する総件数(不明なら null) */
  total: number | null
  /** 上限に達して打ち切ったか */
  truncated: boolean
}

function toAppError(status: number, payload: unknown): AppError {
  const reason =
    (payload as YouTubeApiError | undefined)?.error?.errors?.[0]?.reason ?? ''
  const message =
    (payload as YouTubeApiError | undefined)?.error?.message ?? `HTTP ${status}`

  if (status === 401) return new AppError('unauthorized', message)
  if (status === 403) {
    if (reason === 'quotaExceeded' || reason === 'dailyLimitExceeded') {
      return new AppError('quotaExceeded', message)
    }
    return new AppError('forbidden', message)
  }
  return new AppError('unknown', message)
}

async function fetchPage(
  accessToken: string,
  pageToken?: string,
): Promise<SubscriptionListResponse> {
  const params = new URLSearchParams({
    part: 'snippet',
    mine: 'true',
    maxResults: String(PAGE_SIZE),
  })
  if (pageToken) params.set('pageToken', pageToken)

  let res: Response
  try {
    res = await fetch(`${ENDPOINT}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  } catch {
    throw new AppError('network', 'fetch failed')
  }

  if (!res.ok) {
    const payload = await res.json().catch(() => undefined)
    throw toAppError(res.status, payload)
  }

  return (await res.json()) as SubscriptionListResponse
}

function normalize(item: Subscription): SubscribedChannel {
  const s = item.snippet
  return {
    channelId: s.resourceId.channelId,
    title: s.title,
    thumbnailUrl: s.thumbnails.medium?.url ?? s.thumbnails.default?.url ?? '',
    publishedAt: s.publishedAt,
    subscribedAt: new Date(s.publishedAt),
  }
}

/**
 * 登録チャンネルを全ページ取得する。
 * 取得したデータはこの関数のスコープ外へ永続化しない(呼び出し側もメモリ保持のみ)。
 */
export async function fetchAllSubscriptions(
  accessToken: string,
  onProgress?: (p: FetchProgress) => void,
): Promise<{ channels: SubscribedChannel[]; truncated: boolean }> {
  const channels: SubscribedChannel[] = []
  let pageToken: string | undefined
  let total: number | null = null
  let truncated = false

  for (let page = 0; page < MAX_PAGES; page++) {
    const res = await fetchPage(accessToken, pageToken)
    total = res.pageInfo?.totalResults ?? total
    for (const item of res.items ?? []) channels.push(normalize(item))

    pageToken = res.nextPageToken
    onProgress?.({ loaded: channels.length, total, truncated: false })

    if (!pageToken) break
    if (page === MAX_PAGES - 1) truncated = true
  }

  onProgress?.({ loaded: channels.length, total, truncated })
  return { channels, truncated }
}
