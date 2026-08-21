/**
 * チャンネル名の絞り込み。
 *
 * 日本語では打ち間違いより「文字種の揺れ」で外れることのほうが多いため、
 * 正規化を最優先にしている。そのうえで、完全に 0 件のときだけ
 * 部分列マッチまで緩める 2 段構えにして、通常時に無関係な候補が
 * 混ざらないようにしている。
 */

const HIRAGANA_START = 0x3041
const HIRAGANA_END = 0x3096
const TO_KATAKANA = 0x60

/**
 * 比較用にテキストを均す。
 * - NFKC: 全角英数 → 半角、半角カナ → 全角カナ、合成濁点の結合
 * - 小文字化
 * - ひらがな → カタカナ
 * - 長音記号・ハイフン類の統一
 * - 空白と中黒の除去
 */
export function normalizeForSearch(input: string): string {
  let s = input.normalize('NFKC').toLowerCase()

  let out = ''
  for (const ch of s) {
    const code = ch.codePointAt(0)!
    out +=
      code >= HIRAGANA_START && code <= HIRAGANA_END
        ? String.fromCodePoint(code + TO_KATAKANA)
        : ch
  }
  s = out

  return s.replace(/[ー－―‐-]/g, 'ー').replace(/[\s・､、,]+/g, '')
}

/** 空白区切りを OR の条件として切り出す */
export function splitTerms(query: string): string[] {
  return [
    ...new Set(
      query
        .split(/[\s　]+/)
        .map(normalizeForSearch)
        .filter((t) => t.length > 0),
    ),
  ]
}

/** term の文字が target にこの順で現れるか(連続していなくてよい) */
export function isSubsequence(term: string, target: string): boolean {
  if (term.length === 0) return true
  let i = 0
  for (const ch of target) {
    if (ch === term[i]) {
      i++
      if (i === term.length) return true
    }
  }
  return false
}

export interface FilterResult<T> {
  items: T[]
  /** 部分一致で 0 件だったため、曖昧一致にフォールバックしたか */
  fuzzy: boolean
}

/**
 * @param items    絞り込み対象
 * @param keys     items と同じ並びの正規化済み文字列
 * @param query    ユーザーの入力(生)
 */
export function filterByQuery<T>(
  items: readonly T[],
  keys: readonly string[],
  query: string,
): FilterResult<T> {
  const terms = splitTerms(query)
  if (terms.length === 0) return { items: [...items], fuzzy: false }

  // 1 段目: 部分一致(OR)
  const exact: T[] = []
  for (let i = 0; i < items.length; i++) {
    const key = keys[i] ?? ''
    if (terms.some((t) => key.includes(t))) exact.push(items[i]!)
  }
  if (exact.length > 0) return { items: exact, fuzzy: false }

  // 2 段目: 部分列マッチ(OR)。1 文字だと何にでも当たるので 2 文字以上に限る
  const loose = terms.filter((t) => t.length >= 2)
  if (loose.length === 0) return { items: [], fuzzy: false }

  const fuzzy: T[] = []
  for (let i = 0; i < items.length; i++) {
    const key = keys[i] ?? ''
    if (loose.some((t) => isSubsequence(t, key))) fuzzy.push(items[i]!)
  }
  return { items: fuzzy, fuzzy: fuzzy.length > 0 }
}
