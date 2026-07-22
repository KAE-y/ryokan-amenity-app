import { useEffect, useState } from 'react'
import { useRooms } from './RoomsContext'
import { Header } from './components/Header'
import { RoomList } from './components/RoomList'
import { RoomDetail } from './components/RoomDetail'

export default function App() {
  const { rooms, adminMode } = useRooms()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedRoom = rooms.find((r) => r.id === selectedId) ?? null

  // 選択中の部屋が削除されたら一覧へ戻す
  useEffect(() => {
    if (selectedId && !selectedRoom) setSelectedId(null)
  }, [selectedId, selectedRoom])

  // 画面遷移時にスクロールを先頭へ
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [selectedId])

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-9">
        {selectedRoom ? (
          <RoomDetail room={selectedRoom} onBack={() => setSelectedId(null)} />
        ) : (
          <RoomList onSelect={setSelectedId} />
        )}
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-10 pt-4 sm:px-6">
        <div className="border-t border-line pt-5 text-xs text-ink-faint">
          <p>
            旅館 客室備品詳細（プロトタイプ）— データはブラウザの LocalStorage に保存されます。
            {adminMode && ' 管理者モード：追加・編集・削除が即時保存されます。'}
          </p>
        </div>
      </footer>
    </div>
  )
}
