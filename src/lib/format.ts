/**
 * timeZone を指定していないので、閲覧者のローカルタイムゾーンで表示される。
 * ロケール ja-JP は書式だけを決めるもので、JST を強制するものではない。
 * 日本からのアクセスなら JST、海外からならその土地の時刻になる(意図どおり)。
 */
const DATE_FMT = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const TIME_FMT = new Intl.DateTimeFormat('ja-JP', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

export function formatDate(d: Date): string {
  return DATE_FMT.format(d)
}

export function formatTime(d: Date): string {
  return TIME_FMT.format(d)
}

/**
 * from から to までの長さ。「前」などの向きは付けない。
 * 1 年未満は日数、それ以上は「◯年◯ヶ月」。
 */
export function formatSpan(from: Date, to: Date): string {
  const days = Math.max(0, Math.floor((to.getTime() - from.getTime()) / 86_400_000))
  if (days < 365) return `${days}日`

  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth())
  if (to.getDate() < from.getDate()) months -= 1
  const years = Math.floor(months / 12)
  const rest = months % 12
  return rest === 0 ? `${years}年` : `${years}年${rest}ヶ月`
}

/** 「◯年◯ヶ月前」。1 ヶ月未満は「◯日前」 */
export function formatElapsed(from: Date, now: Date = new Date()): string {
  let months =
    (now.getFullYear() - from.getFullYear()) * 12 + (now.getMonth() - from.getMonth())
  if (now.getDate() < from.getDate()) months -= 1
  if (months < 0) months = 0

  if (months === 0) {
    const days = Math.max(0, Math.floor((now.getTime() - from.getTime()) / 86_400_000))
    return `${days}日前`
  }
  const years = Math.floor(months / 12)
  const rest = months % 12
  if (years === 0) return `${rest}ヶ月前`
  if (rest === 0) return `${years}年前`
  return `${years}年${rest}ヶ月前`
}

/** 経過年数(小数切り捨て) */
export function elapsedYears(from: Date, now: Date = new Date()): number {
  let years = now.getFullYear() - from.getFullYear()
  const anniversary = new Date(from)
  anniversary.setFullYear(from.getFullYear() + years)
  if (anniversary.getTime() > now.getTime()) years -= 1
  return Math.max(0, years)
}
