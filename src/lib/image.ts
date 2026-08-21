/**
 * 画像 URL を data URL に変換する。
 * html-to-image は CORS で汚染された img を書き出せないため、
 * カードに載せるサムネイルだけ事前にインライン化する。失敗したら null。
 */
export async function toDataUrl(url: string): Promise<string | null> {
  if (!url) return null
  try {
    const res = await fetch(url, { mode: 'cors' })
    if (!res.ok) return null
    const blob = await res.blob()
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}
