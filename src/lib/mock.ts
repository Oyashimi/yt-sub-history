import type { SubscribedChannel } from '@/types/youtube'

/**
 * 開発用のダミーデータ。
 * HomeView から動的 import しており、本番ビルドには含まれない。
 */

/** 実行のたびに並びが変わると見比べづらいので固定シードの PRNG を使う */
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const HEADS = [
  'ねこ',
  'うみ',
  'ほし',
  'みどり',
  'あさ',
  'ゆう',
  'そら',
  'つき',
  'かぜ',
  'はな',
  'やま',
  'かわ',
  'もり',
  'ゆき',
  'うた',
]
const TAILS = [
  'チャンネル',
  'ラジオ',
  'ノート',
  '日記',
  '工房',
  '研究所',
  '食堂',
  '部',
  'スタジオ',
  'たいむ',
]
const EN_HEADS = ['Daily', 'Night', 'Slow', 'Open', 'Quiet', 'Paper', 'Radio', 'Midori']
const EN_TAILS = ['Works', 'Lab', 'Studio', 'Club', 'Tapes', 'Room']

/** 行の詰まり具合を確認するための極端な長さのサンプル */
const EDGE_NAMES = [
  'とても長いチャンネル名のサンプルです折り返しと省略の確認用',
  'A',
  'THE MAKING OF ABSOLUTELY EVERYTHING CHANNEL',
  'みそしる',
]

/** 年ごとの登録数。グラフに起伏が出るよう偏らせている */
const YEAR_COUNTS: Array<[number, number]> = [
  [2009, 1],
  [2010, 2],
  [2011, 3],
  [2012, 4],
  [2013, 6],
  [2014, 8],
  [2015, 9],
  [2016, 12],
  [2017, 11],
  [2018, 14],
  [2019, 13],
  [2020, 18],
  [2021, 15],
  [2022, 12],
  [2023, 9],
  [2024, 7],
  [2025, 4],
]

/** サムネの代わりの単色アバター。data URI なので外部通信は発生しない */
function avatarDataUrl(initial: string, tone: number): string {
  const bg = ['#e0d8c8', '#d5ccba', '#cabfab', '#bfb49f'][tone % 4]
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="88" height="88">` +
    `<rect width="88" height="88" fill="${bg}"/>` +
    `<text x="44" y="57" font-size="38" font-family="sans-serif" fill="#6f675e" text-anchor="middle">${initial}</text>` +
    `</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export function generateMockChannels(): SubscribedChannel[] {
  const rand = mulberry32(20260821)
  const out: SubscribedChannel[] = []
  let i = 0

  for (const [year, count] of YEAR_COUNTS) {
    for (let n = 0; n < count; n++) {
      const r = rand()
      let title: string
      if (i < EDGE_NAMES.length && n === 0) {
        title = EDGE_NAMES[i % EDGE_NAMES.length]!
      } else if (r < 0.25) {
        title = `${EN_HEADS[Math.floor(rand() * EN_HEADS.length)]} ${EN_TAILS[Math.floor(rand() * EN_TAILS.length)]}`
      } else {
        title = `${HEADS[Math.floor(rand() * HEADS.length)]}${TAILS[Math.floor(rand() * TAILS.length)]}`
      }

      const month = Math.floor(rand() * 12)
      const day = 1 + Math.floor(rand() * 28)
      const date = new Date(year, month, day)

      // 1 割はサムネ欠損にして、アイコンのフォールバックを確認できるようにする
      const noThumb = rand() < 0.1

      out.push({
        channelId: `UCmock${String(i).padStart(6, '0')}`,
        title,
        thumbnailUrl: noThumb
          ? ''
          : avatarDataUrl(Array.from(title)[0] ?? '?', Math.floor(rand() * 4)),
        publishedAt: date.toISOString(),
        subscribedAt: date,
      })
      i++
    }
  }

  return out
}
