export interface Thumbnail {
  url: string
  width?: number
  height?: number
}

export interface Thumbnails {
  default?: Thumbnail
  medium?: Thumbnail
  high?: Thumbnail
}

export interface SubscriptionSnippet {
  publishedAt: string
  title: string
  description: string
  resourceId: {
    kind: string
    channelId: string
  }
  thumbnails: Thumbnails
}

export interface Subscription {
  kind: string
  etag: string
  id: string
  snippet: SubscriptionSnippet
}

export interface SubscriptionListResponse {
  kind: string
  etag: string
  nextPageToken?: string
  pageInfo: {
    totalResults: number
    resultsPerPage: number
  }
  items: Subscription[]
}

export interface YouTubeApiError {
  error: {
    code: number
    message: string
    errors?: Array<{ domain: string; reason: string; message: string }>
    status?: string
  }
}

export interface ChannelListResponse {
  kind: string
  etag: string
  items: Array<{
    id: string
    snippet: {
      title: string
      /** チャンネルの開設日時 */
      publishedAt: string
    }
  }>
}

/** UI が扱う正規化済みのチャンネル 1 件 */
export interface SubscribedChannel {
  channelId: string
  title: string
  thumbnailUrl: string
  /** 登録日時(ISO 8601) */
  publishedAt: string
  /** 登録日時の Date */
  subscribedAt: Date
  /**
   * チャンネルの開設日時。channels.list を引いた後にだけ入る。
   * 削除済みチャンネルは API が返さないため undefined のままになる。
   */
  channelCreatedAt?: Date
}
