import type { ReactNode } from "react"

interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  leftHeading?: ReactNode
  leftDescription?: string
  badge?: string
  aside?: ReactNode
  isWideForm?: boolean
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  leftHeading,
  leftDescription,
  badge,
  aside,
  isWideForm,
}: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background image */}
      <img
        src="/image/img-background-home-page.png"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      {/* Dark overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(135deg, rgba(10,20,50,0.82) 0%, rgba(15,30,65,0.75) 60%, rgba(10,20,50,0.88) 100%)" }}
      />

      {/* Top navigation bar */}
      <header
        className="relative z-10 flex items-center justify-between px-8 py-3"
        style={{
          background: "rgba(15, 23, 42, 0.16)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="flex items-center gap-2">
          <img
            src="/image/logo-petpees2.png"
            alt="PetPees"
            className="h-10 w-auto object-contain"
          />
          <span className="text-base font-semibold uppercase tracking-[0.18em] text-white/85">
            PetPees
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-100/70">
            <i className="pi pi-phone" />
            +84 989 762 355
          </div>
          {badge && (
            <div className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-200 border border-blue-400/30">
              {badge}
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 flex min-h-[calc(100vh-64px)] items-center px-8 py-8 lg:px-16">
        <div className={`mx-auto flex w-full items-center gap-12 lg:gap-20 ${isWideForm ? "max-w-3xl justify-center" : "max-w-6xl"}`}>

          {/* Left — branding */}
          {!isWideForm && (
            <div className="hidden flex-1 lg:block">
              {aside ?? (leftHeading ?? (
                <>
                  <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
                    Nền tảng
                  </p>
                  <h1 className="mb-4 text-4xl font-extrabold uppercase leading-tight text-white xl:text-5xl">
                    Quản trị &amp; điều hành<br />cửa hàng thú cưng
                  </h1>
                  <p className="max-w-md text-base leading-relaxed text-blue-200/80">
                    {leftDescription ??
                      "Giải pháp toàn diện để quản lý dịch vụ, nhân viên, kho hàng và lịch hẹn cho cửa hàng thú cưng của bạn."}
                  </p>
                </>
              ))}
            </div>
          )}

          {/* Right — form card */}
          <div
            className={`shrink-0 rounded-2xl p-6 shadow-2xl ${isWideForm ? "w-full max-w-xl" : "w-full max-w-sm"}`}
            style={{
              background: "rgba(15, 28, 60, 0.85)",
              border: "1px solid rgba(74, 144, 217, 0.25)",
              backdropFilter: "blur(12px)",
            }}
          >
            {/* Logo + title */}
            <div className="mb-5 flex flex-col items-center gap-2">
              <img
                src="/image/logo-petpees2.png"
                alt="PetPees"
                className="h-20 w-auto object-contain"
              />
              <h2 className="text-lg font-semibold text-white">{title}</h2>
              {subtitle && (
                <p className="text-center text-xs text-blue-200/70">{subtitle}</p>
              )}
            </div>

            {/* Form */}
            <div className="space-y-4">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="mt-5 border-t border-white/10 pt-4 text-center text-xs text-blue-200/60">
                {footer}
              </div>
            )}

            <p className="mt-5 text-center text-[11px] text-blue-300/40">
              Copyright @PetPees 2024
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
