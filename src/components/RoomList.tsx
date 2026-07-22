import { useState } from 'react'
import type { RoomType } from '../types'
import { useRooms } from '../RoomsContext'
import { roomFullName } from '../utils'
import { Eyebrow, IconPlus } from './ui'
import { RoomCard } from './RoomCard'
import { RoomFormModal } from './admin/RoomFormModal'

export function RoomList({ onSelect }: { onSelect: (roomId: string) => void }) {
  const { rooms, adminMode, deleteRoom, updateRoom } = useRooms()
  const [formOpen, setFormOpen] = useState(false)
  const [editRoom, setEditRoom] = useState<RoomType | null>(null)

  const openCreate = () => {
    setEditRoom(null)
    setFormOpen(true)
  }
  const openEdit = (room: RoomType) => {
    setEditRoom(room)
    setFormOpen(true)
  }
  const handleDelete = (room: RoomType) => {
    if (confirm(`「${roomFullName(room)}」を削除しますか？この操作は取り消せません。`)) {
      deleteRoom(room.id)
    }
  }

  return (
    <div>
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <Eyebrow>部屋タイプ一覧</Eyebrow>
          <h2 className="mt-1.5 text-2xl font-semibold text-ink sm:text-[26px]">
            お部屋を選ぶ
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            全 {rooms.length} タイプ。カードを選ぶと間取り図と備品を確認できます。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            admin={adminMode}
            onOpen={() => onSelect(room.id)}
            onEdit={() => openEdit(room)}
            onDelete={() => handleDelete(room)}
            onPhotoChange={(photoUrl) => updateRoom(room.id, { photoUrl })}
          />
        ))}

        {adminMode && (
          <button
            onClick={openCreate}
            className="flex min-h-[172px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ai/35 bg-ai-light/40 p-5 text-ai transition hover:border-ai/60 hover:bg-ai-light"
          >
            <span className="grid h-11 w-11 place-items-center rounded-full bg-ai text-washi shadow-sm">
              <IconPlus />
            </span>
            <span className="text-sm font-medium">新しい部屋タイプを追加</span>
          </button>
        )}
      </div>

      {rooms.length === 0 && !adminMode && (
        <p className="rounded-xl bg-washi p-8 text-center text-ink-faint ring-1 ring-line">
          部屋タイプが登録されていません。管理者モードから追加してください。
        </p>
      )}

      <RoomFormModal open={formOpen} room={editRoom} onClose={() => setFormOpen(false)} />
    </div>
  )
}
