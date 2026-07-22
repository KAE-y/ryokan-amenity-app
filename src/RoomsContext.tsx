import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Amenity, Area, RoomType } from './types'
import { createSeedRooms } from './seedData'
import { parseAmenityString, uid } from './utils'
import { supabase } from './supabaseClient'

const STORAGE_KEY = 'ryokan-amenity-data-v1'
const SUPABASE_TABLE = 'app_state'
const SUPABASE_ROW_ID = 'rooms'

async function loadRoomsFromSupabase(): Promise<RoomType[] | null> {
  if (!supabase) return null

  const { data: row, error } = await supabase
    .from(SUPABASE_TABLE)
    .select('data')
    .eq('id', SUPABASE_ROW_ID)
    .single()

  if (error) {
    console.warn('Supabase からの room データ読み込みに失敗しました。', error)
    return null
  }
  if (!row?.data || !Array.isArray(row.data)) return null
  return migrateRooms(row.data as RoomType[])
}

async function saveRoomsToSupabase(rooms: RoomType[]): Promise<void> {
  if (!supabase) return

  const { error } = await supabase.from(SUPABASE_TABLE).upsert({
    id: SUPABASE_ROW_ID,
    data: rooms,
  })

  if (error) {
    console.error('Supabase への room データ保存に失敗しました。', error)
  }
}

// ---- LocalStorage 読み書き ----

/**
 * 旧形式（name のみの文字列項目）のデータを新形式（name/count/detail）へ移行する。
 * すでに新形式なら手を加えない。
 */
function migrateAmenity(
  a: Amenity & { count?: string; detail?: string; size?: string; manufacturer?: string; partNumber?: string },
): Amenity {
  if (
    typeof a.count === 'string' &&
    typeof a.detail === 'string' &&
    typeof a.size === 'string' &&
    typeof a.manufacturer === 'string' &&
    typeof a.partNumber === 'string'
  ) {
    return {
      id: a.id,
      name: a.name,
      size: a.size,
      areaId: a.areaId ?? '',
      manufacturer: a.manufacturer,
      partNumber: a.partNumber,
      count: a.count,
      detail: a.detail,
      checked: !!a.checked,
    }
  }
  const { name, count, detail } = parseAmenityString(a.name)
  return {
    id: a.id,
    name,
    size: typeof a.size === 'string' ? a.size : '',
    areaId: typeof a.areaId === 'string' ? a.areaId : '',
    manufacturer: typeof a.manufacturer === 'string' ? a.manufacturer : '',
    partNumber: typeof a.partNumber === 'string' ? a.partNumber : '',
    count,
    detail,
    checked: !!a.checked,
  }
}

function migrateRooms(rooms: RoomType[]): RoomType[] {
  return rooms.map((r) => ({
    ...r,
    photoUrl: typeof r.photoUrl === 'string' ? r.photoUrl : '',
    nameSecondary: typeof r.nameSecondary === 'string' ? r.nameSecondary : '',
    amenities: r.amenities.map(migrateAmenity),
    areas: r.areas.map((a) => ({
      ...a,
      photoUrl: typeof a.photoUrl === 'string' ? a.photoUrl : '',
      width: typeof a.width === 'number' ? a.width : 25,
      height: typeof a.height === 'number' ? a.height : 18,
    })),
  }))
}

function loadRooms(): RoomType[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      // 初回起動：空なので初期データを投入
      const seeded = createSeedRooms()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
      return seeded
    }
    const parsed = JSON.parse(raw) as RoomType[]
    if (!Array.isArray(parsed)) throw new Error('invalid data')
    return migrateRooms(parsed)
  } catch (err) {
    console.error('データの読み込みに失敗しました。初期データで再構築します。', err)
    const seeded = createSeedRooms()
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
    } catch {
      /* 保存に失敗してもアプリは継続 */
    }
    return seeded
  }
}

// ---- Context 型 ----

interface RoomsContextValue {
  rooms: RoomType[]
  adminMode: boolean
  setAdminMode: (v: boolean) => void

  addRoom: (data: {
    name: string
    nameSecondary: string
    roomNumbers: string
    floorPlanImageUrl: string
  }) => string
  updateRoom: (
    id: string,
    patch: Partial<
      Pick<RoomType, 'name' | 'nameSecondary' | 'roomNumbers' | 'floorPlanImageUrl' | 'photoUrl'>
    >,
  ) => void
  deleteRoom: (id: string) => void

  addArea: (roomId: string, data: Omit<Area, 'id'>) => void
  updateArea: (roomId: string, areaId: string, patch: Partial<Omit<Area, 'id'>>) => void
  deleteArea: (roomId: string, areaId: string) => void

  addAmenity: (
    roomId: string,
    data: { name: string; size?: string; manufacturer?: string; partNumber?: string; areaId?: string; count?: string; detail?: string },
  ) => void
  updateAmenity: (roomId: string, amenityId: string, patch: Partial<Omit<Amenity, 'id'>>) => void
  deleteAmenity: (roomId: string, amenityId: string) => void
  toggleAmenity: (roomId: string, amenityId: string) => void
  moveAmenity: (roomId: string, amenityId: string, direction: 'up' | 'down') => void
}

const RoomsContext = createContext<RoomsContextValue | null>(null)

export function RoomsProvider({ children }: { children: ReactNode }) {
  const [rooms, setRooms] = useState<RoomType[]>(() => loadRooms())
  const [adminMode, setAdminMode] = useState(false)
  const [supabaseLoaded, setSupabaseLoaded] = useState(false)

  useEffect(() => {
    if (!supabase) {
      setSupabaseLoaded(true)
      return
    }

    let canceled = false
    loadRoomsFromSupabase().then((supabaseRooms) => {
      if (canceled) return
      if (supabaseRooms && supabaseRooms.length > 0) {
        setRooms(supabaseRooms)
      }
      setSupabaseLoaded(true)
    })

    return () => {
      canceled = true
    }
  }, [])

  // rooms が変わるたび LocalStorage と Supabase に同期
  const firstRun = useRef(true)
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms))
    } catch (err) {
      console.error('LocalStorage への保存に失敗しました。', err)
    }

    if (supabase && supabaseLoaded) {
      saveRoomsToSupabase(rooms)
    }
  }, [rooms, supabaseLoaded])

  // 別タブでの変更を反映
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setRooms(JSON.parse(e.newValue))
        } catch {
          /* ignore */
        }
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const patchRoom = useCallback((id: string, fn: (r: RoomType) => RoomType) => {
    setRooms((prev) => prev.map((r) => (r.id === id ? fn(r) : r)))
  }, [])

  const addRoom = useCallback<RoomsContextValue['addRoom']>(
    (data) => {
      const id = uid()
      setRooms((prev) => [
        ...prev,
        {
          id,
          name: data.name,
          nameSecondary: data.nameSecondary,
          roomNumbers: data.roomNumbers,
          photoUrl: '',
          floorPlanImageUrl: data.floorPlanImageUrl,
          areas: [],
          amenities: [],
        },
      ])
      return id
    },
    [],
  )

  const updateRoom = useCallback<RoomsContextValue['updateRoom']>(
    (id, patch) => patchRoom(id, (r) => ({ ...r, ...patch })),
    [patchRoom],
  )

  const deleteRoom = useCallback<RoomsContextValue['deleteRoom']>((id) => {
    setRooms((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const addArea = useCallback<RoomsContextValue['addArea']>(
    (roomId, data) => patchRoom(roomId, (r) => ({ ...r, areas: [...r.areas, { id: uid(), ...data }] })),
    [patchRoom],
  )

  const updateArea = useCallback<RoomsContextValue['updateArea']>(
    (roomId, areaId, patch) =>
      patchRoom(roomId, (r) => ({
        ...r,
        areas: r.areas.map((a) => (a.id === areaId ? { ...a, ...patch } : a)),
      })),
    [patchRoom],
  )

  const deleteArea = useCallback<RoomsContextValue['deleteArea']>(
    (roomId, areaId) => patchRoom(roomId, (r) => ({ ...r, areas: r.areas.filter((a) => a.id !== areaId) })),
    [patchRoom],
  )

  const addAmenity = useCallback<RoomsContextValue['addAmenity']>(
    (roomId, data) =>
      patchRoom(roomId, (r) => ({
        ...r,
        amenities: [
          ...r.amenities,
          {
            id: uid(),
            name: data.name,
            size: data.size ?? '',
            manufacturer: data.manufacturer ?? '',
            areaId: data.areaId ?? '',
            partNumber: data.partNumber ?? '',
            count: data.count ?? '',
            detail: data.detail ?? '',
            checked: false,
          },
        ],
      })),
    [patchRoom],
  )

  const updateAmenity = useCallback<RoomsContextValue['updateAmenity']>(
    (roomId, amenityId, patch) =>
      patchRoom(roomId, (r) => ({ ...r, amenities: r.amenities.map((a) => (a.id === amenityId ? { ...a, ...patch } : a)) })),
    [patchRoom],
  )

  const deleteAmenity = useCallback<RoomsContextValue['deleteAmenity']>(
    (roomId, amenityId) => patchRoom(roomId, (r) => ({ ...r, amenities: r.amenities.filter((a) => a.id !== amenityId) })),
    [patchRoom],
  )

  const toggleAmenity = useCallback<RoomsContextValue['toggleAmenity']>(
    (roomId, amenityId) =>
      patchRoom(roomId, (r) => ({ ...r, amenities: r.amenities.map((a) => (a.id === amenityId ? { ...a, checked: !a.checked } : a)) })),
    [patchRoom],
  )

  const moveAmenity = useCallback<RoomsContextValue['moveAmenity']>(
    (roomId, amenityId, direction) =>
      patchRoom(roomId, (r) => {
        const index = r.amenities.findIndex((a) => a.id === amenityId)
        if (index < 0) return r
        const nextIndex = direction === 'up' ? index - 1 : index + 1
        if (nextIndex < 0 || nextIndex >= r.amenities.length) return r
        const amenities = [...r.amenities]
        const [item] = amenities.splice(index, 1)
        amenities.splice(nextIndex, 0, item)
        return { ...r, amenities }
      }),
    [patchRoom],
  )

  const value = useMemo<RoomsContextValue>(() => ({
    rooms,
    adminMode,
    setAdminMode,
    addRoom,
    updateRoom,
    deleteRoom,
    addArea,
    updateArea,
    deleteArea,
    addAmenity,
    updateAmenity,
    deleteAmenity,
    toggleAmenity,
    moveAmenity,
  }), [
    rooms,
    adminMode,
    setAdminMode,
    addRoom,
    updateRoom,
    deleteRoom,
    addArea,
    updateArea,
    deleteArea,
    addAmenity,
    updateAmenity,
    deleteAmenity,
    toggleAmenity,
    moveAmenity,
  ])

  return <RoomsContext.Provider value={value}>{children}</RoomsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRooms(): RoomsContextValue {
  const ctx = useContext(RoomsContext)
  if (!ctx) throw new Error('useRooms は RoomsProvider の内側で使用してください')
  return ctx
}
