import { elapsedYears } from './format'
import type { SubscribedChannel } from '@/types/youtube'

export interface YearBucket {
  year: number
  count: number
}

export interface Stats {
  total: number
  oldest: SubscribedChannel | null
  newest: SubscribedChannel | null
  /** 最古の登録から現在までの経過年数 */
  yearsSinceOldest: number
  /** 登録から 10 年以上のチャンネル */
  overTenYears: SubscribedChannel[]
  /** 登録から 5 年以上のチャンネル */
  overFiveYears: SubscribedChannel[]
  /** 年ごとの登録数(昇順、空白年も埋める) */
  byYear: YearBucket[]
  /** 最も多く登録した年 */
  busiestYear: YearBucket | null
}

export function buildStats(
  channels: SubscribedChannel[],
  now: Date = new Date(),
): Stats {
  if (channels.length === 0) {
    return {
      total: 0,
      oldest: null,
      newest: null,
      yearsSinceOldest: 0,
      overTenYears: [],
      overFiveYears: [],
      byYear: [],
      busiestYear: null,
    }
  }

  const sorted = [...channels].sort(
    (a, b) => a.subscribedAt.getTime() - b.subscribedAt.getTime(),
  )
  const oldest = sorted[0]!
  const newest = sorted[sorted.length - 1]!

  const counts = new Map<number, number>()
  for (const c of sorted) {
    const y = c.subscribedAt.getFullYear()
    counts.set(y, (counts.get(y) ?? 0) + 1)
  }

  const firstYear = oldest.subscribedAt.getFullYear()
  const lastYear = newest.subscribedAt.getFullYear()
  const byYear: YearBucket[] = []
  for (let y = firstYear; y <= lastYear; y++) {
    byYear.push({ year: y, count: counts.get(y) ?? 0 })
  }

  const busiestYear = byYear.reduce<YearBucket | null>(
    (best, b) => (best === null || b.count > best.count ? b : best),
    null,
  )

  return {
    total: sorted.length,
    oldest,
    newest,
    yearsSinceOldest: elapsedYears(oldest.subscribedAt, now),
    overTenYears: sorted.filter((c) => elapsedYears(c.subscribedAt, now) >= 10),
    overFiveYears: sorted.filter((c) => elapsedYears(c.subscribedAt, now) >= 5),
    byYear,
    busiestYear,
  }
}
