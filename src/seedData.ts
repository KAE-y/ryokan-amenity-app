import type { Amenity, Area, RoomType } from './types'
import { uid } from './utils'

// プレースホルダ写真（読み込めない場合はコンポーネント側でフォールバック表示）
const photo = (label: string) =>
  `https://placehold.co/900x600/2a4a63/faf8f2?text=${encodeURIComponent(label)}`

type AreaSeed = Omit<Area, 'id'>
type AmenitySeed = {
  name: string
  size?: string
  areaId?: string
  manufacturer?: string
  partNumber?: string
  count: string
  detail: string
}
type RoomSeed = {
  name: string
  /** カードで部屋名を2行表示にしたい場合の2行目。無ければ省略可 */
  nameSecondary?: string
  roomNumbers: string
  areas: AreaSeed[]
  amenities: AmenitySeed[]
}

const DEFAULT_AREA_WIDTH = 24
const DEFAULT_AREA_HEIGHT = 18

const area = (
  name: string,
  x: number,
  y: number,
  settingRule: string,
  amenities: string[],
  photoLabel: string,
  width = DEFAULT_AREA_WIDTH,
  height = DEFAULT_AREA_HEIGHT,
): AreaSeed => ({ name, x, y, width, height, settingRule, amenities, photoUrl: photo(photoLabel) })

/** 備品チェックリストの1行を作る（個数・詳細は省略可） */
const am = (
  name: string,
  count = '',
  detail = '',
  size = '',
  manufacturer = '',
  partNumber = '',
  areaId = '',
): AmenitySeed => ({ name, size, areaId, manufacturer, partNumber, count, detail })

const ROOM_SEEDS: RoomSeed[] = [
  {
    name: '禄 Roku',
    roomNumbers: '410',
    areas: [
      area(
        '玄関',
        17,
        82,
        'スリッパを左右揃えて2足設置。傘立てに番傘を1本。式台に季節の設え（枝もの一本）を添える。',
        ['スリッパ ×2', '番傘 ×1', '靴べら'],
        'Genkan',
      ),
      area(
        '洗面台',
        25,
        33,
        '歯ブラシ・カミソリ・ヘアブラシを竹トレイに一列で。フェイスタオルは三つ折りで2枚重ね、コップは伏せて2客。',
        ['歯ブラシ ×2', 'カミソリ ×2', 'ヘアブラシ', 'フェイスタオル ×2', 'コップ ×2'],
        'Washstand',
      ),
      area(
        '床の間',
        70,
        22,
        '一輪挿しに季節の生花を活ける。掛軸の埃を毛ばたきで払い、香炉の位置を中央に整える。',
        ['一輪挿し', '季節の生花', '香炉'],
        'Tokonoma',
      ),
      area(
        '半露天風呂',
        81,
        70,
        'バスタオル2枚を棚に、湯上りタオルを桶の縁に掛ける。木桶と風呂椅子を洗い場中央へ。入浴剤を1包添える。',
        ['バスタオル ×2', '湯桶', '風呂椅子', '入浴剤 ×1'],
        'Open-air Bath',
      ),
    ],
    amenities: [
      am('浴衣', '大・中・小 各1'),
      am('羽織', '×2'),
      am('作務衣', '×2'),
      am('茶器セット', '', '煎茶'),
      am('茶菓子', '', '季節'),
      am('冷蔵庫ドリンク補充'),
      am('金庫の空施錠を確認'),
      am('加湿器の給水'),
    ],
  },
  {
    name: '半露天風呂付スイート',
    roomNumbers: '308, 310, 408',
    areas: [
      area(
        '洗面台',
        22,
        30,
        'ダブルボウルに歯ブラシ・カミソリを左右対称で各2。ハンドタオルを2枚、アメニティ籠を右手前に配置。',
        ['歯ブラシ ×2', 'カミソリ ×2', 'ハンドタオル ×2', 'アメニティ籠'],
        'Washstand',
      ),
      area(
        'リビング座卓',
        45,
        56,
        '座卓中央に茶托と茶碗を2客、ウェルカム菓子を器に盛る。館内案内を右上に立て掛ける。',
        ['茶碗 ×2', '茶托 ×2', 'ウェルカム菓子', '館内案内'],
        'Living',
      ),
      area(
        '床の間',
        69,
        23,
        '掛軸を季節に合わせて掛け替え、花器に一種活け。置き時計の時刻を合わせる。',
        ['花器', '季節の花', '置き時計'],
        'Tokonoma',
      ),
      area(
        '半露天風呂',
        82,
        68,
        'バスタオル2枚・フェイスタオル2枚を用意。ヒノキ枡に日本酒用の枡を1つ添え、椅子と桶を洗い場に。',
        ['バスタオル ×2', 'フェイスタオル ×2', '風呂椅子', '湯桶'],
        'Open-air Bath',
      ),
    ],
    amenities: [
      am('浴衣', '大・中・小 各1'),
      am('羽織', '×3'),
      am('茶器セット', '', '煎茶'),
      am('茶菓子', '', '季節'),
      am('ネスプレッソ用カプセル補充'),
      am('ミネラルウォーター', '×4'),
      am('金庫の空施錠を確認'),
    ],
  },
  {
    name: 'オトナの休日',
    nameSecondary: '半露天風呂付特別室',
    roomNumbers: '401-407',
    areas: [
      area(
        '洗面台',
        24,
        32,
        '歯ブラシ・カミソリを竹トレイに。フェイスタオル2枚、化粧鏡を拭き上げる。',
        ['歯ブラシ ×2', 'カミソリ ×2', 'フェイスタオル ×2'],
        'Washstand',
      ),
      area(
        '床の間',
        68,
        24,
        '一輪挿しに季節の花。掛軸まわりを整え、座布団を床の間前に2枚重ねて。',
        ['一輪挿し', '季節の花', '座布団 ×2'],
        'Tokonoma',
      ),
      area(
        '縁側（広縁）',
        50,
        72,
        '広縁の椅子2脚とテーブルを整え、茶器を1組。読書灯の点灯を確認する。',
        ['ラウンジチェア ×2', '茶器 ×1組', '読書灯'],
        'Engawa',
      ),
      area(
        '半露天風呂',
        82,
        66,
        'バスタオル2枚・湯上りタオル。桶と椅子を配置し、入浴剤を1包添える。',
        ['バスタオル ×2', '湯上りタオル', '入浴剤 ×1'],
        'Open-air Bath',
      ),
    ],
    amenities: [
      am('浴衣', '大・中・小 各1'),
      am('羽織', '×2'),
      am('茶器セット', '', '煎茶'),
      am('茶菓子', '', '季節'),
      am('冷蔵庫ドリンク補充'),
      am('金庫の空施錠を確認'),
    ],
  },
  {
    name: 'みずをり',
    roomNumbers: '201-207, 301-307',
    areas: [
      area(
        '洗面台',
        26,
        34,
        '歯ブラシ・カミソリを1セットずつ。フェイスタオルを2枚、コップを伏せて2客。',
        ['歯ブラシ ×2', 'カミソリ ×2', 'フェイスタオル ×2', 'コップ ×2'],
        'Washstand',
      ),
      area(
        '床の間',
        70,
        26,
        '花器に季節の花を一種。掛軸の位置を整え、埃を払う。',
        ['花器', '季節の花'],
        'Tokonoma',
      ),
      area(
        '広縁',
        52,
        74,
        '椅子2脚・テーブルを整え、茶器を1組。窓際の眺望を妨げないよう荷物台を寄せる。',
        ['椅子 ×2', '茶器 ×1組', '荷物台'],
        'Hiroen',
      ),
    ],
    amenities: [
      am('浴衣', '大・中・小 各1'),
      am('羽織', '×2'),
      am('茶器セット', '', '煎茶'),
      am('茶菓子', '', '季節'),
      am('冷蔵庫ドリンク補充'),
      am('金庫の空施錠を確認'),
    ],
  },
  {
    name: '楽座',
    roomNumbers: '211-215, 311-315',
    areas: [
      area(
        '洗面台',
        27,
        34,
        '歯ブラシ・カミソリを1セット。フェイスタオル2枚、コップ2客を用意する。',
        ['歯ブラシ ×2', 'カミソリ ×2', 'フェイスタオル ×2', 'コップ ×2'],
        'Washstand',
      ),
      area(
        '床の間',
        69,
        28,
        '一輪挿しに季節の花。掛軸の下に季節の設えを一点添える。',
        ['一輪挿し', '季節の花'],
        'Tokonoma',
      ),
    ],
    amenities: [
      am('浴衣', '大・中・小 各1'),
      am('茶器セット', '', '煎茶'),
      am('茶菓子', '', '季節'),
      am('冷蔵庫ドリンク補充'),
      am('金庫の空施錠を確認'),
    ],
  },
  {
    name: '喜 楽',
    roomNumbers: '413, 415',
    areas: [
      area(
        '玄関',
        18,
        80,
        'スリッパを2足揃えて設置。式台を拭き上げ、傘立てを整える。',
        ['スリッパ ×2', '傘立て'],
        'Genkan',
      ),
      area(
        '洗面台',
        28,
        35,
        '歯ブラシ・カミソリを1セット。フェイスタオル2枚とコップ2客を配置。',
        ['歯ブラシ ×2', 'カミソリ ×2', 'フェイスタオル ×2', 'コップ ×2'],
        'Washstand',
      ),
      area(
        '床の間',
        70,
        27,
        '花器に季節の花を活ける。掛軸まわりの埃を払い、置物の位置を整える。',
        ['花器', '季節の花', '置物'],
        'Tokonoma',
      ),
    ],
    amenities: [
      am('浴衣', '大・中・小 各1'),
      am('茶器セット', '', '煎茶'),
      am('茶菓子', '', '季節'),
      am('冷蔵庫ドリンク補充'),
      am('金庫の空施錠を確認'),
    ],
  },
]

/** 初回起動時に投入する初期データを生成 */
export function createSeedRooms(): RoomType[] {
  return ROOM_SEEDS.map((r): RoomType => ({
    id: uid(),
    name: r.name,
    nameSecondary: r.nameSecondary ?? '',
    roomNumbers: r.roomNumbers,
    photoUrl: '',
    floorPlanImageUrl: '',
    areas: r.areas.map((a): Area => ({ id: uid(), ...a })),
    amenities: r.amenities.map((a): Amenity => ({
      id: uid(),
      name: a.name,
      size: a.size ?? '',
      areaId: a.areaId ?? '',
      manufacturer: a.manufacturer ?? '',
      partNumber: a.partNumber ?? '',
      count: a.count,
      detail: a.detail,
      checked: false,
    })),
  }))
}
