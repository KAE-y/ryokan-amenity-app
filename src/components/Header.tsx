import { useRooms } from '../RoomsContext'
import { cx } from '../utils'

export function Header() {
  const { adminMode, setAdminMode } = useRooms()

  return (
    <header
      className={cx(
        'sticky top-0 z-30 border-b bg-washi/90 backdrop-blur transition-colors',
        adminMode ? 'border-shu/40' : 'border-line',
      )}
    >
      {/* 管理者モードのステータスバー */}
      <div
        className={cx(
          'h-1 w-full transition-all',
          adminMode ? 'bg-shu' : 'bg-transparent',
        )}
      />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-3">
          {/* 角丸正方形のロゴマーク */}
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#f59e0b] font-serif text-lg text-white shadow-sm">
            錦
          </span>
          <div className="leading-tight">
            <h1 className="text-lg font-semibold text-ink">客室備品詳細</h1>
            <p className="text-[11px] tracking-wide text-ink-faint">見取り台帳 — SETTING LEDGER</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            role="switch"
            aria-checked={adminMode}
            onClick={() => setAdminMode(!adminMode)}
            className={cx(
              'flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm font-medium ring-1 ring-inset transition',
              adminMode
                ? 'bg-shu/[0.12] text-shu-deep ring-shu/40'
                : 'bg-ink/[0.04] text-ink-soft ring-line hover:bg-ink/[0.07]',
            )}
          >
            <span
              className={cx(
                'grid h-6 w-6 place-items-center rounded-full text-washi transition',
                adminMode ? 'bg-shu' : 'bg-ink-faint',
              )}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
              </svg>
            </span>
            <span className="hidden sm:inline">管理者モード</span>
            <span className="sm:hidden">管理</span>
          </button>
        </div>
      </div>
    </header>
  )
}
