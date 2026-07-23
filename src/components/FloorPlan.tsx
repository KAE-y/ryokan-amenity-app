import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react'
import type { Area, RoomType } from '../types'
import { alternateDriveImageUrl, clampPct, cx, resolveImageUrl, roomFullName } from '../utils'
import { useRooms } from '../RoomsContext'
import { SimpleFloorPlan } from './SimpleFloorPlan'

const DEFAULT_AREA_WIDTH = 24
const DEFAULT_AREA_HEIGHT = 18

export function FloorPlan({
  room,
  admin,
  onPinClick,
  onAddAt,
}: {
  room: RoomType
  admin: boolean
  onPinClick: (area: Area) => void
  onAddAt: (x: number, y: number) => void
}) {
  const { updateArea } = useRooms()
  const containerRef = useRef<HTMLDivElement>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [resizeId, setResizeId] = useState<string | null>(null)
  const resizeState = useRef<{
    areaId: string
    left: number
    top: number
    width: number
    height: number
  } | null>(null)
  const movedRef = useRef(false)
  // ドラッグ後に plane クリックで誤って追加しないための抑制フラグ
  const suppressPlaneClickRef = useRef(false)
  const [imgFailed, setImgFailed] = useState(false)
  const [floorPlanSrc, setFloorPlanSrc] = useState(() => resolveImageUrl(room.floorPlanImageUrl))
  const [imgRatio, setImgRatio] = useState<number | null>(null)
  // 失敗済みのURLを覚えておき、2つの形式を無限に往復しないようにする
  const triedUrls = useRef<Set<string>>(new Set())

  // 間取り図URLが変わったら表示を追従させる（失敗状態・実寸比もリセット）
  useEffect(() => {
    triedUrls.current = new Set()
    setFloorPlanSrc(resolveImageUrl(room.floorPlanImageUrl))
    setImgFailed(false)
    setImgRatio(null)
  }, [room.floorPlanImageUrl])

  // 画像の読み込みに失敗した場合：ドライブの別形式を試し、それも駄目なら簡易間取り図へ
  const handleImageError = () => {
    triedUrls.current.add(floorPlanSrc)
    const alt = alternateDriveImageUrl(floorPlanSrc)
    if (alt && !triedUrls.current.has(alt)) {
      setFloorPlanSrc(alt)
    } else {
      setImgFailed(true)
    }
  }

  const showImage = room.floorPlanImageUrl.trim().length > 0 && !imgFailed
  // 画像表示時はコンテナ自体を画像の縦横比にフィットさせる（下記 aspectRatio）ため、
  // コンテナ＝画像の表示範囲となり、レターボックス補正なしの単純な%変換で正しく一致する。
  const pointToPct = (clientX: number, clientY: number) => {
    const el = containerRef.current
    if (!el) return { x: 0, y: 0 }
    const rect = el.getBoundingClientRect()
    return {
      x: clampPct(((clientX - rect.left) / rect.width) * 100),
      y: clampPct(((clientY - rect.top) / rect.height) * 100),
    }
  }

  const handlePlaneClick = (e: MouseEvent) => {
    if (!admin) return
    if (suppressPlaneClickRef.current) {
      suppressPlaneClickRef.current = false
      return
    }
    const { x, y } = pointToPct(e.clientX, e.clientY)
    onAddAt(x, y)
  }

  const startDrag = (e: PointerEvent, area: Area) => {
    if (!admin) return
    if (resizeId) return
    e.stopPropagation()
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    setDragId(area.id)
    movedRef.current = false
  }

  const startResize = (e: PointerEvent, area: Area) => {
    if (!admin) return
    e.stopPropagation()
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    const width = area.width ?? DEFAULT_AREA_WIDTH
    const height = area.height ?? DEFAULT_AREA_HEIGHT
    resizeState.current = {
      areaId: area.id,
      left: area.x - width / 2,
      top: area.y - height / 2,
      width,
      height,
    }
    setResizeId(area.id)
    setDragId(null)
    movedRef.current = false
  }

  const onPointerMove = (e: PointerEvent) => {
    if (resizeId && resizeState.current) {
      movedRef.current = true
      const point = pointToPct(e.clientX, e.clientY)
      const left = resizeState.current.left
      const top = resizeState.current.top
      const newWidth = clampPct(Math.max(8, Math.min(100 - left, point.x - left)))
      const newHeight = clampPct(Math.max(8, Math.min(100 - top, point.y - top)))
      updateArea(room.id, resizeState.current.areaId, {
        width: newWidth,
        height: newHeight,
        x: left + newWidth / 2,
        y: top + newHeight / 2,
      })
      return
    }
    if (!dragId) return
    movedRef.current = true
    const { x, y } = pointToPct(e.clientX, e.clientY)
    updateArea(room.id, dragId, { x, y })
  }

  const endDrag = (e: PointerEvent, area: Area) => {
    const isResize = resizeId === area.id
    if (!dragId && !isResize) return
    ;(e.target as Element).releasePointerCapture?.(e.pointerId)
    setDragId(null)
    setResizeId(null)
    if (movedRef.current) {
      suppressPlaneClickRef.current = true
      window.setTimeout(() => {
        suppressPlaneClickRef.current = false
      }, 0)
    } else if (dragId === area.id && !isResize) {
      onPinClick(area)
    }
  }

  return (
    <div
      ref={containerRef}
      onClick={handlePlaneClick}
      className={cx(
        'relative w-full select-none overflow-hidden rounded-xl bg-washi ring-1 ring-line',
        // 画像の実寸比が判明するまでは仮の比率で表示し、判明したらその比率にフィットさせる
        (!showImage || !imgRatio) && 'aspect-[8/5.6]',
        admin && 'cursor-crosshair',
      )}
      style={showImage && imgRatio ? { aspectRatio: imgRatio } : undefined}
    >
      {/* 画像が無い/失敗した場合のみ、簡易間取り図をベースとして表示（実写真との二重表示を防ぐ） */}
      {!showImage && (
        <div className="pointer-events-none absolute inset-0">
          <SimpleFloorPlan />
        </div>
      )}

      {/* 画像URLがあれば表示。object-contain で画像全体が必ず収まるようにする */}
      {showImage && (
        <img
          src={floorPlanSrc}
          alt={`${roomFullName(room)} の間取り図`}
          className="pointer-events-none absolute inset-0 h-full w-full object-contain"
          onError={handleImageError}
          onLoad={(e) => {
            const { naturalWidth: w, naturalHeight: h } = e.currentTarget
            if (w > 0 && h > 0) setImgRatio(w / h)
          }}
        />
      )}

      {/* ピン */}
      {room.areas.map((a, i) => (
        <button
          key={a.id}
          type="button"
          onPointerDown={(e) => startDrag(e, a)}
          onPointerMove={onPointerMove}
          onPointerUp={(e) => endDrag(e, a)}
          onClick={(e) => {
            e.stopPropagation()
            if (!admin) onPinClick(a)
          }}
          style={{
            left: `${a.x}%`,
            top: `${a.y}%`,
            width: `${a.width ?? DEFAULT_AREA_WIDTH}%`,
            height: `${a.height ?? DEFAULT_AREA_HEIGHT}%`,
            animationDelay: `${i * 70}ms`,
          }}
          aria-label={`${a.name}${admin ? '（ドラッグで移動 / 角をドラッグでサイズ変更）' : ''}`}
          className={cx(
            'group absolute z-10 -translate-x-1/2 -translate-y-1/2 animate-fade-in',
            admin ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
          )}
        >
          <div className="relative h-full w-full border border-ai/30 bg-ai/20/70 text-center transition hover:bg-ai/30 focus:outline-none focus:ring-2 focus:ring-ai/50">
            <div className="absolute inset-0 bg-ai/20" aria-hidden />
            <div className="relative flex h-full w-full items-center justify-center px-2 text-center text-sm font-semibold text-ai">
              <span>{a.name}</span>
            </div>
            {admin && (
              <span
                onPointerDown={(e) => startResize(e, a)}
                onPointerMove={onPointerMove}
                onPointerUp={(e) => {
                  e.stopPropagation()
                  endDrag(e, a)
                }}
                onClick={(e) => e.stopPropagation()}
                className="pointer-events-auto absolute right-0 bottom-0 h-5 w-5 -translate-x-1/2 translate-y-1/2 cursor-nwse-resize rounded-full border border-ink/30 bg-washi/90 text-transparent"
                aria-label="エリアサイズ変更"
                role="button"
                tabIndex={-1}
              />
            )}
          </div>
        </button>
      ))}

      {admin && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-ink/55 to-transparent px-4 py-2.5">
          <p className="text-[12px] font-medium text-washi">
            図面をタップして新規エリアを追加／エリアをドラッグで移動・角をドラッグでサイズ変更
          </p>
        </div>
      )}
    </div>
  )
}
