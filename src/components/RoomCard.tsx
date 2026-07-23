import { useEffect, useRef, useState } from 'react'
import type { RoomType } from '../types'
import { alternateDriveImageUrl, cx, resolveImageUrl, roomFullName } from '../utils'
import { Button, IconCamera, IconPencil, IconTrash, TextInput } from './ui'

/** 写真URLが未設定、または読み込みに失敗した部屋には、部屋ごとに安定したプレースホルダー写真を割り当てる */
const fallbackPhotoUrl = (room: RoomType) =>
  `https://picsum.photos/seed/${encodeURIComponent(room.id)}/640/800`

export function RoomCard({
  room,
  admin,
  onOpen,
  onEdit,
  onDelete,
  onPhotoChange,
}: {
  room: RoomType
  admin: boolean
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
  onPhotoChange: (photoUrl: string) => void
}) {
  const [editingPhoto, setEditingPhoto] = useState(false)
  const [photoDraft, setPhotoDraft] = useState('')
  const [photoSrc, setPhotoSrc] = useState(() =>
    room.photoUrl ? resolveImageUrl(room.photoUrl) : fallbackPhotoUrl(room),
  )
  // 失敗済みのURLを覚えておき、2つの形式を無限に往復しないようにする
  const triedUrls = useRef<Set<string>>(new Set())

  // 保存された写真URLが変わったら表示を追従させる（失敗時のフォールバック状態もリセット）
  useEffect(() => {
    triedUrls.current = new Set()
    setPhotoSrc(room.photoUrl ? resolveImageUrl(room.photoUrl) : fallbackPhotoUrl(room))
  }, [room])

  const startPhotoEdit = () => {
    setPhotoDraft(room.photoUrl)
    setEditingPhoto(true)
  }
  const savePhoto = () => {
    onPhotoChange(resolveImageUrl(photoDraft))
    setEditingPhoto(false)
  }

  // 画像の読み込みに失敗した場合：ドライブの直リンクならサムネイル形式を試し、それも駄目ならプレースホルダーへ
  const handlePhotoError = () => {
    setPhotoSrc((current) => {
      triedUrls.current.add(current)
      const alt = alternateDriveImageUrl(current)
      if (alt && !triedUrls.current.has(alt)) return alt
      return fallbackPhotoUrl(room)
    })
  }

  return (
    <div
      className={cx(
        'group relative flex flex-col overflow-hidden rounded-2xl bg-washi text-left shadow-card ring-1 ring-line transition',
        'hover:-translate-y-0.5 hover:shadow-lift',
      )}
    >
      <button
        onClick={onOpen}
        className="relative isolate min-h-[220px] flex-1 overflow-hidden text-left focus:outline-none"
        aria-label={`${roomFullName(room)} の詳細を開く`}
      >
        {/* 背景：部屋の実写真（無ければ／読み込み失敗ならプレースホルダー写真） */}
        <img
          src={photoSrc}
          alt=""
          aria-hidden="true"
          onError={handlePhotoError}
          className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {/* 白文字の視認性を確保する、半透明の黒いオーバーレイ */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/60 via-black/35 to-black/20" />

        {/* 部屋名：左上に独立配置（2行目が設定されていれば2行で表示） */}
        <h3 className="absolute left-5 top-5 max-w-[70%] text-3xl font-bold leading-tight text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.65)]">
          {room.name}
          {room.nameSecondary && (
            <>
              <br />
              {room.nameSecondary}
            </>
          )}
        </h3>
        {/* 部屋番号：右下に独立配置 */}
        <p className="tabular absolute bottom-5 right-5 max-w-[70%] text-right font-serif text-2xl font-bold leading-tight text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.65)]">
          {room.roomNumbers || '客室未設定'}
        </p>
      </button>

      {admin && !editingPhoto && (
        <button
          onClick={startPhotoEdit}
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-ink/50 text-white backdrop-blur-sm transition hover:bg-ink/70"
          aria-label={`${roomFullName(room)} の写真を変更`}
        >
          <IconCamera />
        </button>
      )}

      {editingPhoto && (
        <div className="absolute inset-0 z-20 flex flex-col gap-3 overflow-y-auto bg-ink/90 p-5">
          <div>
            <label className="text-xs font-medium text-washi/90">写真のURLを貼り付け</label>
            <TextInput
              autoFocus
              value={photoDraft}
              onChange={(e) => setPhotoDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && savePhoto()}
              placeholder="https://…"
              className="mt-1.5"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="primary" onClick={savePhoto} disabled={!photoDraft.trim()}>
              保存
            </Button>
            <button
              type="button"
              onClick={() => setEditingPhoto(false)}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-washi/80 transition hover:bg-washi/10"
            >
              キャンセル
            </button>
          </div>

          <div className="rounded-lg bg-washi/10 p-3 ring-1 ring-washi/20">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brass">
              写真登録マニュアル
            </p>
            <ol className="mt-1.5 list-decimal space-y-1.5 pl-4 text-[12px] leading-snug text-washi/90">
              <li>
                下の「写真共有フォルダ」に写真をアップロードしてください。
                <br />
                <a
                  href="https://drive.google.com/drive/folders/1YJS2hNJktlfKJaG0gLG9lCNx1shHYs_k?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all font-medium text-washi underline underline-offset-2"
                >
                  写真共有フォルダを開く
                </a>
              </li>
              <li>
                アップロードしたファイルを右クリックし、「共有」からリンクをコピーしてください。
              </li>
              <li>コピーしたURLを、上の入力欄に貼り付けて「保存」ボタンを押してください。</li>
            </ol>
            <p className="mt-2.5 border-t border-washi/15 pt-2 text-[11px] leading-snug text-washi/60">
              ※注意：この共有フォルダは全員で編集可能です。誤って他の人の写真を削除・移動・名前変更しないようご注意ください。
            </p>
            <p className="mt-1.5 text-[11px] leading-snug text-washi/60">
              ※現在この運用は暫定的なものです。会社としての正式なシステム構築までの間、皆さんの協力で運用しています。将来的にリンク先が変更になる可能性があることをご了承ください。
            </p>
          </div>
        </div>
      )}

      {admin && (
        <div className="flex border-t border-line">
          <button
            onClick={onEdit}
            className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-ink-soft transition hover:bg-ai-light hover:text-ai-deep"
          >
            <IconPencil /> 編集
          </button>
          <span className="w-px bg-line" />
          <button
            onClick={onDelete}
            className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-ink-soft transition hover:bg-shu-light hover:text-shu-deep"
          >
            <IconTrash /> 削除
          </button>
        </div>
      )}
    </div>
  )
}
