import { useRef } from "react"
import { Menu } from "primereact/menu"
import type { MenuItem } from "primereact/menuitem"

type TableActionMenuProps = {
  items: MenuItem[]
}

const DELETE_ACTION_CLASS = "table-action-menu__delete"

function isDeleteAction(item: MenuItem) {
  const label = typeof item.label === "string" ? item.label.trim().toLowerCase() : ""
  const icon = typeof item.icon === "string" ? item.icon : ""

  return label.startsWith("xóa") || icon.includes("pi-trash")
}

function mergeClassName(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ")
}

export function TableActionMenu({ items }: TableActionMenuProps) {
  const menuLeft = useRef<Menu>(null)
  const styledItems = items.map((item) =>
    isDeleteAction(item)
      ? { ...item, className: mergeClassName(item.className, DELETE_ACTION_CLASS) }
      : item
  )

  return (
    <div className="flex justify-center">
      <Menu model={styledItems} popup ref={menuLeft} id="popup_menu_left" popupAlignment="right" />
      <button
        type="button"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
        onClick={(event) => menuLeft.current?.toggle(event)}
        aria-controls="popup_menu_left"
        aria-haspopup
      >
        <i className="pi pi-ellipsis-v" />
      </button>
    </div>
  )
}
