const DATE_FMT = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function formatDate(d: Date): string {
  return DATE_FMT.format(d)
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
