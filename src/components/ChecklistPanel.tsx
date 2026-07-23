import { useEffect, useRef, useState } from 'react'
import type { RoomType } from '../types'
import { useRooms } from '../RoomsContext'
import { alternateDriveImageUrl, cx, resolveImageUrl, roomFullName } from '../utils'
import {
  Button,
  Eyebrow,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconClose,
  IconPencil,
  IconPlus,
  IconTrash,
  TextInput,
} from './ui'

const ITEM_GRID = 'grid gap-3 sm:grid-cols-[minmax(0,1.5fr)_120px_96px_auto] sm:items-center'
const EDIT_GRID = 'grid gap-3 sm:grid-cols-[minmax(0,1.5fr)_120px_96px_auto]'

type Draft = {
  name: string
  size: string
  manufacturer: string
  partNumber: string
  areaIds: string[]
  photoUrl: string
  count: string
  detail: string
  /** この備品を共有する他の部屋タイプID（自分の部屋タイプは含まない） */
  roomTypeIds: string[]
}
const emptyDraft: Draft = {
  name: '',
  size: '',
  manufacturer: '',
  partNumber: '',
  areaIds: [],
  photoUrl: '',
  count: '',
  detail: '',
  roomTypeIds: [],
}

/** 備品カードに表示する小さな写真。未設定または読み込み失敗時は何も表示しない */
function AmenityThumb({ url, name }: { url: string; name: string }) {
  const [src, setSrc] = useState(() => resolveImageUrl(url))
  const [failed, setFailed] = useState(false)
  const triedUrls = useRef<Set<string>>(new Set())

  useEffect(() => {
    triedUrls.current = new Set()
    setFailed(false)
    setSrc(resolveImageUrl(url))
  }, [url])

  if (!url.trim() || failed) return null

  const handleError = () => {
    triedUrls.current.add(src)
    const alt = alternateDriveImageUrl(src)
    if (alt && !triedUrls.current.has(alt)) {
      setSrc(alt)
    } else {
      setFailed(true)
    }
  }

  return (
    <img
      src={src}
      alt={`${name} の写真`}
      onError={handleError}
      className="h-[84px] w-[84px] shrink-0 rounded-lg object-cover ring-1 ring-line"
    />
  )
}

/** チェックボックス式の複数選択ドロップダウン（エリア選択・共有部屋タイプ選択で共用） */
function MultiSelectDropdown({
  options,
  value,
  onChange,
  emptyLabel,
}: {
  options: { id: string; label: string }[]
  value: string[]
  onChange: (ids: string[]) => void
  emptyLabel: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])
  }

  const label =
    value.length === 0
      ? emptyLabel
      : options
          .filter((o) => value.includes(o.id))
          .map((o) => o.label)
          .join('、') || emptyLabel

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-line bg-white/70 px-3 py-2 text-left text-sm text-ink transition focus:border-ai focus:bg-white focus:outline-none focus:ring-2 focus:ring-ai/25"
      >
        <span className="truncate">{label}</span>
        <IconChevronDown />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 max-h-60 w-full min-w-[180px] overflow-y-auto rounded-lg border border-line bg-white py-1 shadow-lift">
          <label className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-ink transition hover:bg-ink/5">
            <input
              type="checkbox"
              checked={value.length === 0}
              onChange={() => onChange([])}
              className="h-4 w-4 rounded border-line accent-ai"
            />
            {emptyLabel}
          </label>
          {options.length === 0 && (
            <p className="px-3 py-2 text-xs text-ink-faint">選択できる項目がありません</p>
          )}
          {options.map((o) => (
            <label
              key={o.id}
              className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-ink transition hover:bg-ink/5"
            >
              <input
                type="checkbox"
                checked={value.includes(o.id)}
                onChange={() => toggle(o.id)}
                className="h-4 w-4 rounded border-line accent-ai"
              />
              {o.label}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

export function ChecklistPanel({ room, admin }: { room: RoomType; admin: boolean }) {
  const { rooms, addAmenity, updateAmenity, deleteAmenity, moveAmenity } = useRooms()
  const [newDraft, setNewDraft] = useState<Draft>(emptyDraft)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<Draft>(emptyDraft)

  const total = room.amenities.length
  const otherRoomOptions = rooms
    .filter((r) => r.id !== room.id)
    .map((r) => ({ id: r.id, label: roomFullName(r) }))

  const submitNew = () => {
    const name = newDraft.name.trim()
    if (!name) return
    addAmenity(room.id, {
      name,
      size: newDraft.size.trim(),
      manufacturer: newDraft.manufacturer.trim(),
      partNumber: newDraft.partNumber.trim(),
      areaIds: newDraft.areaIds,
      photoUrl: newDraft.photoUrl.trim(),
      count: newDraft.count.trim(),
      detail: newDraft.detail.trim(),
      roomTypeIds: newDraft.roomTypeIds,
    })
    setNewDraft(emptyDraft)
  }

  const startEdit = (id: string, current: Draft) => {
    setEditingId(id)
    setEditDraft(current)
  }
  const commitEdit = () => {
    if (editingId) {
      const name = editDraft.name.trim()
      if (name) {
        updateAmenity(room.id, editingId, {
          name,
          size: editDraft.size.trim(),
          manufacturer: editDraft.manufacturer.trim(),
          partNumber: editDraft.partNumber.trim(),
          count: editDraft.count.trim(),
          detail: editDraft.detail.trim(),
          areaIds: editDraft.areaIds,
          photoUrl: editDraft.photoUrl.trim(),
          roomTypeIds: editDraft.roomTypeIds,
        })
      }
    }
    setEditingId(null)
  }
  const cancelEdit = () => setEditingId(null)

  return (
    <section className="rounded-xl bg-washi p-5 shadow-card ring-1 ring-line">
      <div className="mb-4">
        <Eyebrow>備品と詳細</Eyebrow>
        <h3 className="mt-1 text-lg font-semibold text-ink">部屋全体の詳細</h3>
      </div>

      {total > 0 ? (
        <div className="space-y-3">
          {room.amenities.map((a, index) => {
            const matchedAreaNames = room.areas.filter((ar) => a.areaIds.includes(ar.id)).map((ar) => ar.name)
            const areaName =
              a.areaIds.length === 0 ? '部屋全体' : matchedAreaNames.length > 0 ? matchedAreaNames.join('、') : '未設定のエリア'
            const sharedRoomNames = rooms
              .filter((r) => r.id !== room.id && r.amenities.some((am) => am.groupId === a.groupId))
              .map((r) => roomFullName(r))
            return (
              <div key={a.id} className="rounded-3xl border border-line bg-white/90 p-4 shadow-sm">
                {editingId === a.id ? (
                  <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1.5fr)_120px_96px] sm:items-center">
                      <TextInput
                        autoFocus
                        placeholder="備品名"
                        value={editDraft.name}
                        onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && commitEdit()}
                      />
                      <TextInput
                        placeholder="サイズ"
                        value={editDraft.size}
                        onChange={(e) => setEditDraft((d) => ({ ...d, size: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && commitEdit()}
                      />
                      <TextInput
                        placeholder="個数"
                        value={editDraft.count}
                        onChange={(e) => setEditDraft((d) => ({ ...d, count: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && commitEdit()}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-ink">どこのエリアの備品ですか？（複数選択可）</label>
                      <MultiSelectDropdown
                        options={room.areas.map((ar) => ({ id: ar.id, label: ar.name }))}
                        value={editDraft.areaIds}
                        onChange={(ids) => setEditDraft((d) => ({ ...d, areaIds: ids }))}
                        emptyLabel="部屋全体"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-ink">
                        共有する部屋タイプ（複数選択可）
                      </label>
                      <MultiSelectDropdown
                        options={otherRoomOptions}
                        value={editDraft.roomTypeIds}
                        onChange={(ids) => setEditDraft((d) => ({ ...d, roomTypeIds: ids }))}
                        emptyLabel="このお部屋のみ"
                      />
                      <p className="mt-1.5 text-xs text-ink-faint">
                        選択した部屋タイプの「部屋全体の詳細」にも同じ備品カードが追加され、エリア以外の項目が共有されます。
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-ink">
                        写真URL（Googleドライブの共有リンク可）
                      </label>
                      <TextInput
                        value={editDraft.photoUrl}
                        onChange={(e) => setEditDraft((d) => ({ ...d, photoUrl: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && commitEdit()}
                        placeholder="https://drive.google.com/…"
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1.4fr)_140px_140px] sm:items-center">
                      <TextInput
                        placeholder="メーカー"
                        value={editDraft.manufacturer}
                        onChange={(e) => setEditDraft((d) => ({ ...d, manufacturer: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && commitEdit()}
                      />
                      <TextInput
                        placeholder="品番"
                        value={editDraft.partNumber}
                        onChange={(e) => setEditDraft((d) => ({ ...d, partNumber: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && commitEdit()}
                      />
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="primary" onClick={commitEdit} className="h-10 px-4">
                          保存
                        </Button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="grid h-10 w-10 place-items-center rounded-lg text-ink-soft transition hover:bg-ink/5"
                          aria-label="取消"
                        >
                          <IconClose />
                        </button>
                      </div>
                    </div>

                    <TextInput
                      placeholder="詳細"
                      value={editDraft.detail}
                      onChange={(e) => setEditDraft((d) => ({ ...d, detail: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && commitEdit()}
                      className="min-h-[80px]"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid gap-3">
                      <div className="grid gap-3 sm:grid-cols-[minmax(0,1.4fr)_120px_96px] sm:items-center">
                        <div className="flex items-center gap-3">
                          <AmenityThumb url={a.photoUrl ?? ''} name={a.name} />
                          <div className="min-w-0">
                            <p
                              className={cx(
                                'text-base font-semibold transition',
                                a.checked ? 'text-ink-faint line-through' : 'text-ink',
                              )}
                            >
                              {a.name}
                            </p>
                            <p className="mt-1 text-sm text-ink-soft">{areaName}</p>
                            {sharedRoomNames.length > 0 && (
                              <p className="mt-0.5 text-xs text-ai">使用部屋：{sharedRoomNames.join('、')}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-ink-soft">
                          <p className="font-medium text-ink">サイズ</p>
                          <p className={cx('truncate', a.checked ? 'text-ink-faint line-through' : 'text-ink-soft')}>
                            {a.size || 'ー'}
                          </p>
                        </div>
                        <div className="text-sm text-ink-soft">
                          <p className="font-medium text-ink">個数</p>
                          <p className={cx('truncate', a.checked ? 'text-ink-faint line-through' : 'text-ink-soft')}>
                            {a.count || 'ー'}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-[minmax(0,1.4fr)_120px_120px] sm:items-center">
                        <div className="text-sm text-ink-soft">
                          <p className="font-medium text-ink">メーカー</p>
                          <p className={cx('truncate', a.checked ? 'text-ink-faint line-through' : 'text-ink-soft')}>
                            {a.manufacturer || 'ー'}
                          </p>
                        </div>
                        <div className="text-sm text-ink-soft">
                          <p className="font-medium text-ink">品番</p>
                          <p className={cx('truncate', a.checked ? 'text-ink-faint line-through' : 'text-ink-soft')}>
                            {a.partNumber || 'ー'}
                          </p>
                        </div>
                        {admin && (
                          <div className="flex items-center gap-1 justify-end">
                            <button
                              type="button"
                              onClick={() => moveAmenity(room.id, a.id, 'up')}
                              className="grid h-10 w-10 place-items-center rounded-lg border border-line text-ink-soft transition hover:bg-ink/5"
                              aria-label="上に移動"
                              disabled={index === 0}
                            >
                              <IconChevronUp />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveAmenity(room.id, a.id, 'down')}
                              className="grid h-10 w-10 place-items-center rounded-lg border border-line text-ink-soft transition hover:bg-ink/5"
                              aria-label="下に移動"
                              disabled={index === room.amenities.length - 1}
                            >
                              <IconChevronDown />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p
                          className={cx(
                            'text-sm leading-relaxed text-ink-soft',
                            a.checked ? 'text-ink-faint line-through' : 'text-ink-soft',
                          )}
                        >
                          {a.detail || '詳細なし'}
                        </p>
                        {admin && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                startEdit(a.id, {
                                  name: a.name,
                                  size: a.size ?? '',
                                  manufacturer: a.manufacturer ?? '',
                                  partNumber: a.partNumber ?? '',
                                  areaIds: a.areaIds ?? [],
                                  photoUrl: a.photoUrl ?? '',
                                  count: a.count,
                                  detail: a.detail,
                                  roomTypeIds: rooms
                                    .filter((r) => r.id !== room.id && r.amenities.some((am) => am.groupId === a.groupId))
                                    .map((r) => r.id),
                                })
                              }
                              className="grid h-10 w-10 place-items-center rounded-lg text-ink-soft transition hover:bg-ink/5 hover:text-ai"
                              aria-label={`${a.name} を編集`}
                            >
                              <IconPencil />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`「${a.name}」を削除しますか？`)) {
                                  deleteAmenity(room.id, a.id)
                                }
                              }}
                              className="grid h-10 w-10 place-items-center rounded-lg text-ink-soft transition hover:bg-shu-light hover:text-shu-deep"
                              aria-label={`${a.name} を削除`}
                            >
                              <IconTrash />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <p className="py-6 text-center text-sm text-ink-faint">備品が登録されていません。</p>
      )}

      {admin && (
        <div className="mt-4 border-t border-line pt-4">
          <p className="mb-3 text-sm font-semibold text-ink">備品を追加</p>
          <div className="space-y-3 rounded-3xl border border-line bg-white/90 p-4 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1.5fr)_120px_96px] sm:items-center">
              <TextInput
                placeholder="備品名（例：浴衣）"
                value={newDraft.name}
                onChange={(e) => setNewDraft((d) => ({ ...d, name: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && submitNew()}
              />
              <TextInput
                placeholder="サイズ（例：Lサイズ）"
                value={newDraft.size}
                onChange={(e) => setNewDraft((d) => ({ ...d, size: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && submitNew()}
              />
              <TextInput
                placeholder="個数（例：×2)"
                value={newDraft.count}
                onChange={(e) => setNewDraft((d) => ({ ...d, count: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && submitNew()}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-ink">どこのエリアの備品ですか？（複数選択可）</label>
              <MultiSelectDropdown
                options={room.areas.map((ar) => ({ id: ar.id, label: ar.name }))}
                value={newDraft.areaIds}
                onChange={(ids) => setNewDraft((d) => ({ ...d, areaIds: ids }))}
                emptyLabel="部屋全体"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-ink">共有する部屋タイプ（複数選択可）</label>
              <MultiSelectDropdown
                options={otherRoomOptions}
                value={newDraft.roomTypeIds}
                onChange={(ids) => setNewDraft((d) => ({ ...d, roomTypeIds: ids }))}
                emptyLabel="このお部屋のみ"
              />
              <p className="mt-1.5 text-xs text-ink-faint">
                選択した部屋タイプの「部屋全体の詳細」にも同じ備品カードが追加され、エリア以外の項目が共有されます。
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-ink">写真URL（Googleドライブの共有リンク可）</label>
              <TextInput
                value={newDraft.photoUrl}
                onChange={(e) => setNewDraft((d) => ({ ...d, photoUrl: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && submitNew()}
                placeholder="https://drive.google.com/…"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(0,1.4fr)_140px_140px] sm:items-center">
              <TextInput
                placeholder="メーカー（例：YKK）"
                value={newDraft.manufacturer}
                onChange={(e) => setNewDraft((d) => ({ ...d, manufacturer: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && submitNew()}
              />
              <TextInput
                placeholder="品番（例：ABC-123）"
                value={newDraft.partNumber}
                onChange={(e) => setNewDraft((d) => ({ ...d, partNumber: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && submitNew()}
              />
              <Button variant="primary" onClick={submitNew} disabled={!newDraft.name.trim()} className="h-10">
                <IconPlus /> 追加
              </Button>
            </div>

            <TextInput
              placeholder="詳細"
              value={newDraft.detail}
              onChange={(e) => setNewDraft((d) => ({ ...d, detail: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && submitNew()}
              className="min-h-[80px]"
            />
          </div>
        </div>
      )}
    </section>
  )
}
