import { useEffect, type ReactNode } from "react"
import { X } from "lucide-react"

type AppDialogProps = {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  size?: "default" | "lg"
  disableClose?: boolean
}

export function AppDialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "default",
  disableClose = false,
}: AppDialogProps) {
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !disableClose) {
        onClose()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, onClose, disableClose])

  if (!open) return null

  const sizeClass = size === "lg" ? "max-w-3xl" : "max-w-md"

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4"
      onClick={() => {
        if (!disableClose) {
          onClose()
        }
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`w-full ${sizeClass} overflow-hidden rounded-lg bg-white shadow-[0_24px_56px_rgba(15,23,42,0.28)]`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-[#f0f0f0] px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>

          {!disableClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-slate-500 transition hover:bg-[#f5f5f5] hover:text-slate-700"
              aria-label="Đóng dialog"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {children && <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>}

        {footer && <div className="flex items-center justify-end gap-2 border-t border-[#f0f0f0] px-5 py-4">{footer}</div>}
      </div>
    </div>
  )
}
