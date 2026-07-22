import { useState } from 'react'
import type { Area, RoomType } from '../types'
import { useRooms } from '../RoomsContext'
import { roomFullName } from '../utils'
import { Button, Eyebrow, IconChevronLeft, IconPencil, IconPlus, TextInput } from './ui'
import { FloorPlan } from './FloorPlan'
import { AreaModal } from './AreaModal'
import { ChecklistPanel } from './ChecklistPanel'
import { AreaFormModal, type AreaDraft } from './admin/AreaFormModal'

export function RoomDetail({ room, onBack }: { room: RoomType; onBack: () => void }) {
  const { adminMode, updateRoom } = useRooms()
  const [viewArea, setViewArea] = useState<Area | null>(null)
  const [areaDraft, setAreaDraft] = useState<AreaDraft | null>(null)
  const [editingFloorPlan, setEditingFloorPlan] = useState(false)
  const [floorPlanDraft, setFloorPlanDraft] = useState('')

  const openAreaForEdit = (area: Area) => setAreaDraft({ area })
  const openAreaForAdd = (x: number, y: number) => setAreaDraft({ area: null, x, y })

  const startFloorPlanEdit = () => {
    setFloorPlanDraft(room.floorPlanImageUrl)
    setEditingFloorPlan(true)
  }
  const saveFloorPlan = () => {
    updateRoom(room.id, { floorPlanImageUrl: floorPlanDraft.trim() })
    setEditingFloorPlan(false)
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-ink-soft transition hover:text-ai"
      >
        <IconChevronLeft /> 部屋タイプ一覧へ戻る
      </button>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>お部屋の詳細</Eyebrow>
          <h2 className="mt-1.5 text-2xl font-semibold text-ink sm:text-3xl">{roomFullName(room)}</h2>
          <p className="mt-1.5 text-sm text-ink-soft">
            該当客室：
            <span className="ml-1 rounded-md bg-ai-light px-2 py-0.5 font-medium text-ai-deep tabular">
              {room.roomNumbers || '未設定'}
            </span>
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* 間取り図：上段に大きく表示 */}
        <section>
          <div className="rounded-2xl bg-washi p-5 shadow-card ring-1 ring-line">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <Eyebrow>見取り図</Eyebrow>
                <h3 className="mt-1 text-lg font-semibold text-ink">
                  エリアをタップして設えを確認
                </h3>
              </div>
              {adminMode && (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={startFloorPlanEdit}>
                    <IconPencil /> 間取り図URLを編集
                  </Button>
                  <Button variant="ghost" onClick={() => openAreaForAdd(50, 50)}>
                    <IconPlus /> エリア追加
                  </Button>
                </div>
              )}
            </div>

            {editingFloorPlan && (
              <div className="mb-4 flex flex-col gap-2 rounded-lg bg-ai-light/50 p-3 sm:flex-row sm:items-center">
                <TextInput
                  autoFocus
                  value={floorPlanDraft}
                  onChange={(e) => setFloorPlanDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveFloorPlan()}
                  placeholder="https://…（空欄なら簡易間取り図を表示）"
                  className="flex-1"
                />
                <div className="flex gap-2">
                  <Button variant="primary" onClick={saveFloorPlan}>
                    保存
                  </Button>
                  <Button variant="quiet" onClick={() => setEditingFloorPlan(false)}>
                    キャンセル
                  </Button>
                </div>
              </div>
            )}

            <FloorPlan
              room={room}
              admin={adminMode}
              onPinClick={adminMode ? openAreaForEdit : setViewArea}
              onAddAt={openAreaForAdd}
            />

            {room.areas.length === 0 && (
              <p className="mt-4 rounded-lg bg-ai-light/50 px-4 py-3 text-sm text-ink-soft">
                エリアが未登録です。
                {adminMode
                  ? '図面をタップするか「エリア追加」から登録してください。'
                  : '管理者モードで追加できます。'}
              </p>
            )}
          </div>
        </section>

        {/* 備品チェックリスト：下段に横幅いっぱいで表示 */}
        <div className="w-full">
          <ChecklistPanel room={room} admin={adminMode} />
        </div>
      </div>

      {/* 閲覧用モーダル（画面3） */}
      <AreaModal area={viewArea} onClose={() => setViewArea(null)} />

      {/* 管理者用モーダル */}
      <AreaFormModal
        open={areaDraft !== null}
        roomId={room.id}
        draft={areaDraft}
        onClose={() => setAreaDraft(null)}
      />
    </div>
  )
}
