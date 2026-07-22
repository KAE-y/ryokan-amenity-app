import { useState } from 'react'
import type { RoomType } from '../types'
import { useRooms } from '../RoomsContext'
import { cx } from '../utils'
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
  areaId: string
  count: string
  detail: string
}
const emptyDraft: Draft = { name: '', size: '', manufacturer: '', partNumber: '', areaId: '', count: '', detail: '' }

export function ChecklistPanel({ room, admin }: { room: RoomType; admin: boolean }) {
  const { addAmenity, updateAmenity, deleteAmenity, moveAmenity } = useRooms()
  const [newDraft, setNewDraft] = useState<Draft>(emptyDraft)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<Draft>(emptyDraft)

  const total = room.amenities.length

  const submitNew = () => {
    const name = newDraft.name.trim()
    if (!name) return
    addAmenity(room.id, {
      name,
      size: newDraft.size.trim(),
      manufacturer: newDraft.manufacturer.trim(),
      partNumber: newDraft.partNumber.trim(),
      areaId: newDraft.areaId.trim(),
      count: newDraft.count.trim(),
      detail: newDraft.detail.trim(),
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
          areaId: editDraft.areaId.trim(),
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
            const areaName = room.areas.find((ar) => ar.id === a.areaId)?.name || (a.areaId ? '未設定のエリア' : '部屋全体')
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
                      <label className="mb-2 block text-sm font-medium text-ink">どこのエリアの備品ですか？</label>
                      <select
                        value={editDraft.areaId}
                        onChange={(e) => setEditDraft((d) => ({ ...d, areaId: e.target.value }))}
                        className="w-full rounded-lg border border-line bg-white/70 px-3 py-2 text-sm text-ink placeholder:text-ink-faint transition focus:border-ai focus:bg-white focus:outline-none focus:ring-2 focus:ring-ai/25"
                      >
                        <option value="">部屋全体</option>
                        {room.areas.map((ar) => (
                          <option key={ar.id} value={ar.id}>
                            {ar.name}
                          </option>
                        ))}
                      </select>
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
                        <div>
                          <p
                            className={cx(
                              'text-base font-semibold transition',
                              a.checked ? 'text-ink-faint line-through' : 'text-ink',
                            )}
                          >
                            {a.name}
                          </p>
                          <p className="mt-1 text-sm text-ink-soft">{areaName}</p>
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
                                  areaId: a.areaId ?? '',
                                  count: a.count,
                                  detail: a.detail,
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
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1.4fr_120px_96px_140px_140px_auto] sm:items-center">
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
            <div>
              <label className="mb-2 block text-sm font-medium text-ink">どこのエリアの備品ですか？</label>
              <select
                value={newDraft.areaId}
                onChange={(e) => setNewDraft((d) => ({ ...d, areaId: e.target.value }))}
                className="w-full rounded-lg border border-line bg-white/70 px-3 py-2 text-sm text-ink placeholder:text-ink-faint transition focus:border-ai focus:bg-white focus:outline-none focus:ring-2 focus:ring-ai/25"
              >
                <option value="">部屋全体</option>
                {room.areas.map((ar) => (
                  <option key={ar.id} value={ar.id}>
                    {ar.name}
                  </option>
                ))}
              </select>
            </div>
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
            <Button variant="primary" onClick={submitNew} disabled={!newDraft.name.trim()}>
              <IconPlus /> 追加
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
