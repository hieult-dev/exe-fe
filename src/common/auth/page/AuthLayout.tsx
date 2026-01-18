import type { ReactNode } from "react"
import { ShieldCheck, Sparkles, Heart } from "lucide-react"

interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  badge?: string
  aside?: ReactNode
}

export function AuthLayout({ title, subtitle, children, footer, badge, aside }: AuthLayoutProps) {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-sky-50 via-white to-blue-50">
      <div className="pointer-events-none absolute -top-32 -right-24 h-64 w-64 rounded-full bg-sky-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-64 w-64 rounded-full bg-blue-200/60 blur-3xl" />

      <div className="container mx-auto px-4 py-10">
        <div className="mx-auto w-full max-w-5xl">
          <div className="grid gap-6 lg:grid-cols-[1fr,420px] items-stretch">
            <div className="hidden lg:flex flex-col justify-between rounded-2xl border border-white/70 bg-white/70 p-8 shadow-lg backdrop-blur">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                  {badge ?? "PETPEEs"}
                </div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Chăm sóc thú cưng nhanh hơn, an tâm hơn.
                </h1>
                <p className="text-sm text-slate-600">
                  Đặt lịch spa, mua sắm và quản lý đơn hàng trong một nơi.
                </p>

                {aside ?? (
                  <ul className="space-y-3 text-sm text-slate-700">
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-sky-600" />
                      Bảo mật thông tin tài khoản
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-sky-600" />
                      Đặt dịch vụ nhanh chỉ 2 bước
                    </li>
                    <li className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-sky-600" />
                      Ưu đãi dành cho khách hàng thân thiết
                    </li>
                  </ul>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs text-slate-600">
                <div className="rounded-lg bg-white/80 p-3 border border-white/70">
                  <div className="text-lg font-bold text-slate-900">2k+</div>
                  Đơn hàng
                </div>
                <div className="rounded-lg bg-white/80 p-3 border border-white/70">
                  <div className="text-lg font-bold text-slate-900">4.9</div>
                  Đánh giá
                </div>
                <div className="rounded-lg bg-white/80 p-3 border border-white/70">
                  <div className="text-lg font-bold text-slate-900">60m</div>
                  Phản hồi
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6 shadow-xl">
              <div className="space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  PETPEEs ACCESS
                </div>
                <h2 className="text-2xl font-bold">{title}</h2>
                {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
              </div>

              <div className="pt-5">{children}</div>

              {footer ? (
                <div className="border-t border-border pt-4 text-sm text-muted-foreground">
                  {footer}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
