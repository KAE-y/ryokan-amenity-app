import { useEffect, useState } from 'react'
import type { RoomType } from '../../types'
import { useRooms } from '../../RoomsContext'
import { Button, Field, Modal, ModalHeader, TextInput } from '../ui'

export function RoomFormModal({
  open,
  room,
  onClose,
}: {
  open: boolean
  /** 編集対象。null なら新規作成 */
  room: RoomType | null
  onClose: () => void
}) {
  const { addRoom, updateRoom } = useRooms()
  const [name, setName] = useState('')
  const [nameSecondary, setNameSecondary] = useState('')
  const [roomNumbers, setRoomNumbers] = useState('')

  useEffect(() => {
    if (open) {
      setName(room?.name ?? '')
      setNameSecondary(room?.nameSecondary ?? '')
      setRoomNumbers(room?.roomNumbers ?? '')
    }
  }, [open, room])

  const canSave = name.trim().length > 0

  const save = () => {
    if (!canSave) return
    const data = {
      name: name.trim(),
      nameSecondary: nameSecondary.trim(),
      roomNumbers: roomNumbers.trim(),
      // 間取り図URLはこのモーダルでは編集しない（部屋詳細ページで編集）ため、既存値をそのまま引き継ぐ
      floorPlanImageUrl: room?.floorPlanImageUrl ?? '',
    }
    if (room) updateRoom(room.id, data)
    else addRoom(data)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} labelledBy="room-form-title" size="md">
      <ModalHeader
        id="room-form-title"
        title={room ? '部屋タイプを編集' : '部屋タイプを追加'}
        onClose={onClose}
        accent
      />
      <div className="space-y-4 p-5">
        <Field label="部屋名（1行目）">
          <TextInput
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例：オトナの休日"
          />
        </Field>
        <Field label="部屋名（2行目）" hint="任意。カードで2行表示にしたい場合のみ入力">
          <TextInput
            value={nameSecondary}
            onChange={(e) => setNameSecondary(e.target.value)}
            placeholder="例：半露天風呂付特別室"
          />
        </Field>
        <Field label="該当客室番号" hint="カンマ区切り可">
          <TextInput
            value={roomNumbers}
            onChange={(e) => setRoomNumbers(e.target.value)}
            placeholder="例：201-207, 301-307"
          />
        </Field>
      </div>
      <div className="flex justify-end gap-2 border-t border-line px-5 py-4">
        <Button variant="quiet" onClick={onClose}>
          キャンセル
        </Button>
        <Button variant="primary" onClick={save} disabled={!canSave}>
          保存
        </Button>
      </div>
    </Modal>
  )
}
