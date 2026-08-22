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
 * from から to までの長さを「◯日◯時間」で返す。「後」などの向きは付けない。
 *
 * 年月には丸めない。「開設からどれだけ経って登録したか」は日数どうしを
 * 比べたい値で、丸めると 3 日と 300 日の差が同じ「◯年」に埋もれてしまう。
 * 1 日未満は時間だけを出す。
 *
 * 差は絶対時間で取るので、夏時間やタイムゾーンの影響を受けない。
 */
export function formatSpan(from: Date, to: Date): string {
  const ms = Math.max(0, to.getTime() - from.getTime())
  const days = Math.floor(ms / 86_400_000)
  const hours = Math.floor((ms % 86_400_000) / 3_600_000)
  if (days === 0) return `${hours}時間`
  return `${days.toLocaleString('ja-JP')}日${hours}時間`
}

/**
 * 開設から登録までのミリ秒。並べ替えの基準に使う。
 * 開設日は後追いで埋まるので、まだ無いうちは null。
 */
export function spanMs(from: Date | undefined, to: Date): number | null {
  if (!from) return null
  return Math.max(0, to.getTime() - from.getTime())
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
