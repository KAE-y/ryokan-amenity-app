import { useEffect, useState } from 'react'
import type { Area } from '../../types'
import { useRooms } from '../../RoomsContext'
import { clampPct } from '../../utils'
import { Button, Field, IconTrash, Modal, ModalHeader, TextArea, TextInput } from '../ui'

export type AreaDraft = {
  /** 編集対象。null なら新規 */
  area: Area | null
  /** 新規作成時の初期座標 */
  x?: number
  y?: number
}

export function AreaFormModal({
  open,
  roomId,
  draft,
  onClose,
}: {
  open: boolean
  roomId: string
  draft: AreaDraft | null
  onClose: () => void
}) {
  const { addArea, updateArea, deleteArea } = useRooms()
  const editing = draft?.area ?? null

  const [name, setName] = useState('')
  const [x, setX] = useState(50)
  const [y, setY] = useState(50)
  const [photoUrl, setPhotoUrl] = useState('')
  const [settingRule, setSettingRule] = useState('')

  useEffect(() => {
    if (!open) return
    setName(editing?.name ?? '')
    setX(editing?.x ?? draft?.x ?? 50)
    setY(editing?.y ?? draft?.y ?? 50)
    setPhotoUrl(editing?.photoUrl ?? '')
    setSettingRule(editing?.settingRule ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const canSave = name.trim().length > 0

  const save = () => {
    if (!canSave) return
    const data = {
      name: name.trim(),
      x: clampPct(x),
      y: clampPct(y),
      photoUrl: photoUrl.trim(),
      settingRule: settingRule.trim(),
    }
    if (editing) updateArea(roomId, editing.id, data)
    else addArea(roomId, data)
    onClose()
  }

  const remove = () => {
    if (editing && confirm(`「${editing.name}」を削除しますか？`)) {
      deleteArea(roomId, editing.id)
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={onClose} labelledBy="area-form-title" size="md">
      <ModalHeader
        id="area-form-title"
        title={editing ? 'エリアを編集' : 'エリアを追加'}
        onClose={onClose}
        accent
      />
      <div className="space-y-4 p-5">
        <Field label="名称">
          <TextInput
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例：洗面台 / 床の間"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="X座標" hint="0〜100 %">
            <TextInput
              type="number"
              min={0}
              max={100}
              value={x}
              onChange={(e) => setX(Number(e.target.value))}
            />
          </Field>
          <Field label="Y座標" hint="0〜100 %">
            <TextInput
              type="number"
              min={0}
              max={100}
              value={y}
              onChange={(e) => setY(Number(e.target.value))}
            />
          </Field>
        </div>
        <p className="-mt-1 text-xs text-ink-faint">
          ※ 図面上でエリアをドラッグすると位置が更新されます。サイズ変更は図面上の角をドラッグしてください。
        </p>

        <Field label="写真URL" hint="空欄ならプレースホルダ表示">
          <TextInput
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="https://…"
          />
        </Field>

        <Field label="セッティングルール">
          <TextArea
            rows={4}
            value={settingRule}
            onChange={(e) => setSettingRule(e.target.value)}
            placeholder="置くべき備品や整え方を記入…"
          />
        </Field>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-line px-5 py-4">
        {editing ? (
          <Button variant="danger" onClick={remove}>
            <IconTrash /> 削除
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button variant="quiet" onClick={onClose}>
            キャンセル
          </Button>
          <Button variant="primary" onClick={save} disabled={!canSave}>
            保存
          </Button>
        </div>
      </div>
    </Modal>
  )
}
