/** 一意なIDを生成 */
export const uid = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/** className を結合（falsy は除外） */
export const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(' ')

/** 数値を 0〜100 に丸める（座標クランプ用） */
export const clampPct = (n: number): number => Math.min(100, Math.max(0, Math.round(n * 10) / 10))

/**
 * 備品名の１行文字列（旧データ形式）を「備品名 / 個数 / 詳細」の3項目に分割する。
 * 新形式へのデータ移行（LocalStorage の旧データ救済）専用のヒューリスティック。
 * 例）"浴衣（大・中・小 各1）" → { name: "浴衣", count: "大・中・小 各1", detail: "" }
 * 例）"羽織 ×2"            → { name: "羽織", count: "×2", detail: "" }
 * 例）"茶器セット・煎茶"     → { name: "茶器セット", count: "", detail: "煎茶" }
 * 例）"茶菓子（季節）"       → { name: "茶菓子", count: "", detail: "季節" }
 * 個数・詳細が見つからない場合はそれぞれ空文字になる。
 */
export const parseAmenityString = (raw: string): { name: string; count: string; detail: string } => {
  const isCountLike = (s: string) => /[×0-9]/.test(s)

  const paren = raw.match(/^(.+?)\s*[（(]([^）)]+)[）)]\s*$/)
  if (paren) {
    const [, name, inner] = paren
    return isCountLike(inner)
      ? { name: name.trim(), count: inner.trim(), detail: '' }
      : { name: name.trim(), count: '', detail: inner.trim() }
  }

  const suffix = raw.match(/^(.+?)\s*(×\s*\d+.*)$/)
  if (suffix) return { name: suffix[1].trim(), count: suffix[2].trim(), detail: '' }

  const nakaguro = raw.match(/^([^・]+)・(.+)$/)
  if (nakaguro) return { name: nakaguro[1].trim(), count: '', detail: nakaguro[2].trim() }

  return { name: raw.trim(), count: '', detail: '' }
}

/** 部屋名の1行目・2行目を結合した完全な部屋名を返す（カード以外での表示・読み上げ用） */
export const roomFullName = (room: { name: string; nameSecondary: string }): string =>
  room.nameSecondary ? `${room.name} ${room.nameSecondary}` : room.name

/** 拡張子から見て画像ファイルへの直リンクと判断できるURLか */
const isDirectImageUrl = (url: string): boolean => /\.(jpe?g|png|gif|webp|svg|bmp|avif)(\?.*)?$/i.test(url)

/**
 * 画像URLを、そのまま<img>に渡せる形式に正規化する。
 * ・すでに画像ファイルへの直リンク（.jpg / .png など）ならそのまま返す。
 * ・Googleドライブの共有リンク（.../file/d/FILE_ID/view、?id=FILE_ID、
 *   すでに lh3.googleusercontent.com/d/FILE_ID 形式のものも含む）は、
 *   ファイルIDを取り出してGoogle公式の thumbnail API 形式に変換する
 *   （lh3.googleusercontent.com は非公式な裏技で、環境によって読み込めないことがあるため）。
 * ・上記のいずれでもない場合や、IDを抽出できない場合は入力をそのまま返す（エラーにしない）。
 */
export const resolveImageUrl = (url: string): string => {
  const trimmed = url.trim()
  if (!trimmed) return trimmed
  if (isDirectImageUrl(trimmed)) return trimmed

  const fileId =
    trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1] ??
    trimmed.match(/drive\.google\.com\/.*[?&]id=([a-zA-Z0-9_-]+)/)?.[1] ??
    trimmed.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/)?.[1]

  return fileId ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000` : trimmed
}

/**
 * Googleドライブ画像の読み込みに失敗した場合の代替URL（別形式）を返す。
 * thumbnail API 形式で失敗した場合は lh3.googleusercontent.com 形式を、
 * その逆に失敗した場合は thumbnail API 形式を試す。どちらでもなければ null。
 */
export const alternateDriveImageUrl = (url: string): string | null => {
  const thumbFileId = url.match(/drive\.google\.com\/thumbnail\?id=([a-zA-Z0-9_-]+)/)?.[1]
  if (thumbFileId) return `https://lh3.googleusercontent.com/d/${thumbFileId}`

  const lh3FileId = url.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/)?.[1]
  if (lh3FileId) return `https://drive.google.com/thumbnail?id=${lh3FileId}&sz=w2000`

  return null
}