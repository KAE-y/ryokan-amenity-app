import {
  useEffect,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react'
import { cx } from '../utils'

// ---- Modal ----

export function Modal({
  open,
  onClose,
  children,
  labelledBy,
  size = 'md',
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
  labelledBy?: string
  size?: 'md' | 'lg' | 'xl'
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-0 backdrop-blur-sm animate-fade-in sm:items-center sm:p-6"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onMouseDown={(e) => e.stopPropagation()}
        className={cx(
          'max-h-[92vh] sm:max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-washi shadow-lift ring-1 ring-line animate-scale-in sm:rounded-2xl',
          size === 'xl'
            ? 'sm:max-w-5xl sm:w-[90vw]'
            : size === 'lg'
            ? 'sm:max-w-3xl sm:w-auto'
            : 'sm:max-w-lg sm:w-auto',
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function ModalHeader({
  title,
  onClose,
  id,
  accent,
}: {
  title: string
  onClose: () => void
  id?: string
  accent?: boolean
}) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-washi/95 px-5 py-4 backdrop-blur">
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          className={cx('h-4 w-1 rounded-full', accent ? 'bg-shu' : 'bg-ai')}
          aria-hidden
        />
        <h2 id={id} className="truncate text-lg font-semibold text-ink">
          {title}
        </h2>
      </div>
      <button
        onClick={onClose}
        aria-label="閉じる"
        className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition hover:bg-ink/5 hover:text-ink"
      >
        <IconClose />
      </button>
    </div>
  )
}

// ---- Buttons ----

type Variant = 'primary' | 'ghost' | 'danger' | 'quiet'

const variantClass: Record<Variant, string> = {
  primary: 'bg-ai text-washi hover:bg-ai-deep shadow-sm',
  danger: 'bg-shu text-washi hover:bg-shu-deep shadow-sm',
  ghost: 'bg-transparent text-ai ring-1 ring-inset ring-ai/30 hover:bg-ai-light',
  quiet: 'bg-ink/[0.04] text-ink-soft hover:bg-ink/[0.08]',
}

export function Button({
  variant = 'primary',
  className,
  children,
  type,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type={type ?? 'button'}
      {...props}
      className={cx(
        'inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
        variantClass[variant],
        className,
      )}
    >
      {children}
    </button>
  )
}

// ---- Form fields ----

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-2 text-sm font-medium text-ink">
        {label}
        {hint && <span className="text-xs font-normal text-ink-faint">{hint}</span>}
      </span>
      {children}
    </label>
  )
}

const fieldBase =
  'w-full rounded-lg border border-line bg-white/70 px-3 py-2 text-sm text-ink placeholder:text-ink-faint transition focus:border-ai focus:bg-white focus:outline-none focus:ring-2 focus:ring-ai/25'

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(fieldBase, props.className)} />
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cx(fieldBase, 'resize-y leading-relaxed', props.className)} />
}

// ---- Eyebrow label ----

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brass">
      {children}
    </span>
  )
}

// ---- Icons (inline SVG, currentColor) ----

export function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}
export function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
export function IconPencil() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}
export function IconTrash() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14" />
    </svg>
  )
}
export function IconChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}
export function IconChevronUp() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 15l6-6 6 6" />
    </svg>
  )
}
export function IconChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}
export function IconCamera() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8h3l2-2h6l2 2h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="14" r="3.5" />
    </svg>
  )
}
export function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}
