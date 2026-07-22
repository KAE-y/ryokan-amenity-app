import { useState } from 'react'
import type { Area } from '../types'
import { Eyebrow, Modal, ModalHeader } from './ui'
import { useRooms } from '../RoomsContext'
import { alternateDriveImageUrl, cx, resolveImageUrl } from '../utils'

function AreaPhoto({ url, name }: { url: string; name: string }) {
  const [failed, setFailed] = useState(false)
  const resolvedUrl = resolveImageUrl(url)
  const show = resolvedUrl.trim().length > 0 && !failed

  if (!show) {
    return (
      <div className="grid aspect-[3/2] w-full place-items-center bg-ai-light">
        <div className="text-center">
          <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full bg-ai/15 text-ai">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <circle cx="9" cy="11" r="2" />
              <path d="M21 17l-5-5-8 7" />
            </svg>
          </div>
          <p className="text-sm text-ink-soft">写真は登録されていません</p>
          <p className="mt-0.5 font-serif text-ink">{name}</p>
        </div>
      </div>
    )
  }

  return (
    <img
      src={resolvedUrl}
      alt={`${name} の写真`}
      className="aspect-[3/2] w-full object-cover"
      onError={() => setFailed(true)}
    />
  )
}

function AreaAmenities({ areaId, showEmpty = true }: { areaId: string; showEmpty?: boolean }) {
  const { rooms } = useRooms()
  const room = rooms.find((r) => r.areas.some((ar) => ar.id === areaId))
  const items = room ? room.amenities.filter((am) => am.areaId === areaId) : []

  if (!items || items.length === 0) {
    if (!showEmpty) return null
    return (
      <section>
        <Eyebrow>備品詳細</Eyebrow>
        <p className="mt-2 text-sm text-ink-soft">このエリアには登録された備品がありません。</p>
      </section>
    )
  }

  return (
    <section>
      <Eyebrow>備品詳細</Eyebrow>
      <div className="mt-3 space-y-3">
        {items.map((a) => (
          <div key={a.id} className="rounded-2xl border border-line bg-white/90 p-3 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className={cx('text-base font-semibold', a.checked ? 'text-ink-faint line-through' : 'text-ink')}>
                  {a.name}
                </p>
                <p className="text-sm text-ink-soft mt-1">
                  サイズ: {a.size || 'ー'} ・ 個数: {a.count || 'ー'}
                </p>
                <p className="text-sm text-ink-soft mt-1">メーカー: {a.manufacturer || 'ー'} ・ 品番: {a.partNumber || 'ー'}</p>
              </div>
            </div>
            <p className="mt-2 text-sm text-ink-soft">{a.detail || '詳細なし'}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function AreaModal({ area, onClose }: { area: Area | null; onClose: () => void }) {
  const open = area !== null
  return (
    <Modal open={open} onClose={onClose} labelledBy="area-modal-title" size="xl">
      {area && (
        <>
          <ModalHeader id="area-modal-title" title={area.name} onClose={onClose} />
          <AreaPhoto url={area.photoUrl} name={area.name} />
          <div className="space-y-5 p-5">
            <section>
              <Eyebrow>詳細</Eyebrow>
              <p className="mt-2 whitespace-pre-wrap text-[15px] leading-7 text-ink">
                {area.settingRule || '詳細は登録されていません。'}
              </p>
            </section>
            <AreaAmenities areaId={area.id} />
          </div>
        </>
      )}
    </Modal>
  )
}
