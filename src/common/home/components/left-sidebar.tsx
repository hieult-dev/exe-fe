import {
    Cat,
    Dog,
    Heart,
    Flame,
    Tag,
    PawPrint,
    BookOpen,
    Phone,
    PartyPopper,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"

const items = [
    { label: "Meo", sub: "Cat & Kitten", icon: Cat },
    { label: "Cho", sub: "Dog & Puppy", icon: Dog },
    { label: "Danh sach yeu thich", sub: "Wish List", icon: Heart },
    { label: "Flash sale", sub: "Sieu giam gia", icon: Flame },
    { label: "Gia tot hom nay", sub: "Today's Deals", icon: Tag },
    { label: "Thuong hieu", sub: "Brand", icon: PawPrint },
    { label: "Cam nang thu cung", sub: "Petmall Blog", icon: BookOpen },
    { label: "Hotline", sub: "0902.848.949", icon: Phone },
    { label: "Petmall season end year", sub: "", icon: PartyPopper },
]

type LeftSidebarProps = {
    collapsed: boolean
    onToggle: () => void
}

export function LeftSidebar({ collapsed, onToggle }: LeftSidebarProps) {
    return (
        <>
            <button
                type="button"
                onClick={onToggle}
                className={`fixed top-32 z-[60] grid h-9 w-9 place-items-center rounded-full border bg-white shadow-sm transition-[left] duration-300 ${collapsed ? "left-3" : "left-[260px]"
                    }`}
            >
                {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>

            <aside
                className={`relative hidden lg:block shrink-0 transition-[width] duration-300 ${collapsed ? "w-0" : "w-64"
                    }`}
            >
                {!collapsed && (
                    <div className="sticky top-28">
                        <div className="rounded-2xl border bg-white p-4 shadow-sm">
                            <div className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                                Danh muc
                            </div>

                            <div className="mt-4 space-y-2">
                                {items.map((item) => {
                                    const Icon = item.icon
                                    return (
                                        <a
                                            key={item.label}
                                            href="#"
                                            className="flex items-start gap-3 rounded-lg px-2 py-2 hover:bg-slate-50"
                                        >
                                            <div className="grid h-9 w-9 place-items-center rounded-full bg-rose-50 text-rose-600">
                                                <Icon className="h-4 w-4" />
                                            </div>

                                            <div className="text-sm">
                                                <div className="font-semibold text-slate-900">
                                                    {item.label}
                                                </div>
                                                {item.sub ? (
                                                    <div className="text-xs text-slate-500">
                                                        {item.sub}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </a>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </aside>
        </>
    )
}
