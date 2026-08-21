import { AppError } from './errors'
import type {
  ChannelListResponse,
  SubscribedChannel,
  Subscription,
  SubscriptionListResponse,
  YouTubeApiError,
} from '@/types/youtube'

const ENDPOINT = 'https://www.googleapis.com/youtube/v3/subscriptions'

/**
 * 1 ページ 50 件 × 40 ページ = 最大 2,000 件で打ち切る。
 *
 * subscriptions.list に「古い順」の order は無く、既定は関連度順。
 * つまり打ち切りが発生すると「最古の登録」が取りこぼされうる。
 * YouTube の登録上限が 2,000 チャンネルなので、そこまで取り切れば
 * 実質的に打ち切りは起きない。
 *
 * クォータは 1 ページ = 1 ユニットだが、ページは必要な分しか取らないため
 * 上限を上げても登録数が少ないユーザーの消費は増えない。
 */
export const MAX_PAGES = 40
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
): Promise<{
  channels: SubscribedChannel[]
  /** 同一 channelId が複数返ってきた件数。通常は 0 */
  duplicates: number
  truncated: boolean
}> {
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

  const { channels: unique, duplicates } = dedupeByChannel(channels)

  if (import.meta.env.DEV && duplicates > 0) {
    console.warn(
      `[subscriptions] 同一チャンネルの重複を ${duplicates} 件検出しました ` +
        `(取得 ${channels.length} 件 → ${unique.length} 件)。` +
        `各チャンネルにつき最も古い登録日を採用しています。`,
    )
  }

  onProgress?.({ loaded: unique.length, total, truncated })
  return { channels: unique, duplicates, truncated }
}

const CHANNELS_ENDPOINT = 'https://www.googleapis.com/youtube/v3/channels'

/**
 * 登録先チャンネルの開設日をまとめて引く。
 *
 * channels.list は id をカンマ区切りで 50 件まで受けられて 1 リクエスト = 1 ユニット。
 * subscriptions と同じ 50 件粒度なので、クォータ消費はおおよそ 2 倍になる。
 *
 * 削除済みのチャンネルは応答に含まれないため、戻り値の Map から欠落する。
 */
export async function fetchChannelCreatedAt(
  accessToken: string,
  channelIds: string[],
  onChunk?: (partial: Map<string, Date>) => void,
): Promise<Map<string, Date>> {
  const out = new Map<string, Date>()

  const chunks: string[][] = []
  for (let i = 0; i < channelIds.length; i += PAGE_SIZE) {
    chunks.push(channelIds.slice(i, i + PAGE_SIZE))
  }

  let next = 0
  let failure: unknown = null

  /**
   * 空いたワーカーが先頭から chunk を取っていく。
   * 直列に回すと 2,000 件で 40 往復ぶんの待ちがそのまま表示の遅れになるため。
   */
  async function worker() {
    while (next < chunks.length && !failure) {
      const chunk = chunks[next++]!
      try {
        const partial = await fetchCreatedAtChunk(accessToken, chunk)
        for (const [id, at] of partial) out.set(id, at)
        // 1 チャンク終わるたびに渡す。全部そろうのを待たずに画面へ出せる
        onChunk?.(partial)
      } catch (e) {
        failure = e
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CREATED_AT_CONCURRENCY, chunks.length) }, worker),
  )

  // 途中まで埋まった分は呼び出し側に渡してあるので、失敗はここで初めて投げる
  if (failure) throw failure

  return out
}

/** 開設日取得の同時リクエスト数。クォータは変わらず、待ち時間だけが縮む */
const CREATED_AT_CONCURRENCY = 4

async function fetchCreatedAtChunk(
  accessToken: string,
  chunk: string[],
): Promise<Map<string, Date>> {
  const params = new URLSearchParams({
    part: 'snippet',
    id: chunk.join(','),
    maxResults: String(PAGE_SIZE),
  })

  let res: Response
  try {
    res = await fetch(`${CHANNELS_ENDPOINT}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  } catch {
    throw new AppError('network', 'fetch failed')
  }
  if (!res.ok) {
    const payload = await res.json().catch(() => undefined)
    throw toAppError(res.status, payload)
  }

  const json = (await res.json()) as ChannelListResponse
  const out = new Map<string, Date>()
  for (const item of json.items ?? []) {
    if (item.snippet?.publishedAt) out.set(item.id, new Date(item.snippet.publishedAt))
  }
  return out
}

/**
 * channelId 単位で重複を潰す。
 *
 * subscriptions.list が返すのは「現在有効な登録」のみで、解除・再登録しても
 * 履歴は積み上がらない仕様。つまり本来ここで重複は出ない。
 * ただしページングは関連度順(既定)で進むため、順序が揺れて同じ項目が
 * 別ページに現れる可能性がゼロとは言い切れないので保険をかけている。
 *
 * 重複した場合は「最も古い登録日」を残す。このサイトが見せたいのは
 * 最初に登録した日なので、新しい方を採るとその答えが失われる。
 */
export function dedupeByChannel(items: SubscribedChannel[]): {
  channels: SubscribedChannel[]
  duplicates: number
} {
  const byId = new Map<string, SubscribedChannel>()
  let duplicates = 0

  for (const c of items) {
    const prev = byId.get(c.channelId)
    if (!prev) {
      byId.set(c.channelId, c)
      continue
    }
    duplicates++
    if (c.subscribedAt.getTime() < prev.subscribedAt.getTime()) byId.set(c.channelId, c)
  }

  return { channels: [...byId.values()], duplicates }
}
