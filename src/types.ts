// ---- データ構造（部屋タイプ / エリア / 備品） ----

/** 部屋全体の備品一覧の項目（スプレッドシート風の行データ） */
export interface Amenity {
  id: string
  /** 同じ備品を複数の部屋タイプで共有する際の共通ID（部屋タイプごとに1レコード持つ）。共有していなければ自分の id と同じ */
  groupId: string
  /** 備品名（例：「コーヒーカップ」「浴衣」など） */
  name: string
  /** サイズ・仕様（例：「大」「Lサイズ」「高さ20cm」など。無ければ空文字） */
  size: string
  /** この備品が置かれているエリアのID一覧（空配列なら部屋共通） */
  areaIds: string[]
  /** 備品の写真URL（空文字なら未設定。Googleドライブの共有リンクも可） */
  photoUrl: string
  /** メーカー / ブランド名。無ければ空文字 */
  manufacturer: string
  /** 品番 / 型番。無ければ空文字 */
  partNumber: string
  /** 個数（例：「2個」「大・中・小 各1」「×2」など。無ければ空文字） */
  count: string
  /** 詳細・補足（例：「陶器」「薄ピンク色」など。無ければ空文字） */
  detail: string
  /** チェックリストでの確認済みフラグ */
  checked: boolean
}

/** 間取り図上のピン（エリア）と、その場所のセッティング情報 */
export interface Area {
  id: string
  name: string
  /** エリアの中心X座標（間取り図に対する 0〜100 のパーセント） */
  x: number
  /** エリアの中心Y座標（間取り図に対する 0〜100 のパーセント） */
  y: number
  /** エリアの横幅（間取り図に対する 0〜100 のパーセント） */
  width?: number
  /** エリアの高さ（間取り図に対する 0〜100 のパーセント） */
  height?: number
  /** その場所の写真URL（空ならプレースホルダを表示） */
  photoUrl: string
  /** 置くべき備品・セッティングルール（本文テキスト） */
  settingRule: string
}

/** 部屋タイプ */
export interface RoomType {
  id: string
  /** 部屋名（1行目） */
  name: string
  /** 部屋名の2行目（例：「オトナの休日」に対する「半露天風呂付特別室」）。無ければ空文字で1行表示 */
  nameSecondary: string
  /** 該当客室番号（例: "201-207, 301-307"） */
  roomNumbers: string
  /** 部屋カードに表示する実写真のURL（空なら仮の写真を表示） */
  photoUrl: string
  /** 間取り図の画像URL（空なら簡易間取り図を描画） */
  floorPlanImageUrl: string
  /** 間取り図上のエリア（ピン）一覧 */
  areas: Area[]
  /** 部屋全体の備品チェックリスト */
  amenities: Amenity[]
}
