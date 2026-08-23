import { spanMs } from './format'
import type { SubscribedChannel } from '@/types/youtube'

/**
 * 並べ替えの基準。
 * sinceOpen 系は「登録先チャンネルの開設から、登録するまでの長さ」で並べる。
 */
export type SortOrder = 'oldest' | 'newest' | 'sinceOpenShort' | 'sinceOpenLong'

/**
 * 並べ替えた新しい配列を返す。元の配列は触らない。
 *
 * 一覧と書き出し画像の両方から呼ぶ。同じ「古い順」で違う並びが出ると、
 * 画像が一覧の写しに見えなくなるため、基準はここ 1 か所に置く。
 */
export function sortChannels(
  channels: readonly SubscribedChannel[],
  order: SortOrder,
): SubscribedChannel[] {
  const list = [...channels]

  if (order === 'oldest' || order === 'newest') {
    list.sort((a, b) =>
      order === 'oldest'
        ? a.subscribedAt.getTime() - b.subscribedAt.getTime()
        : b.subscribedAt.getTime() - a.subscribedAt.getTime(),
    )
    return list
  }

  /**
   * 開設からの長さで並べる。
   * 開設日は後追いで埋まるので、まだ無い行は末尾へ寄せる。
   * 0 として扱うと先頭を占拠し、埋まるたびに行が大きく飛んでしまう。
   * 同じ長さどうし・未取得どうしは登録が古い順にして、並びを安定させる。
   */
  list.sort((a, b) => {
    const sa = spanMs(a.channelCreatedAt, a.subscribedAt)
    const sb = spanMs(b.channelCreatedAt, b.subscribedAt)
    if (sa === null || sb === null) {
      if (sa === null && sb === null) {
        return a.subscribedAt.getTime() - b.subscribedAt.getTime()
      }
      return sa === null ? 1 : -1
    }
    if (sa !== sb) return order === 'sinceOpenShort' ? sa - sb : sb - sa
    return a.subscribedAt.getTime() - b.subscribedAt.getTime()
  })
  return list
}
