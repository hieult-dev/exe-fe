import { useEffect, useMemo, useState } from "react"
import { Button } from "primereact/button"
import { Dialog } from "primereact/dialog"
import { Dropdown } from "primereact/dropdown"
import { InputTextarea } from "primereact/inputtextarea"
import type { AdminShopDTO } from "@/apps/admin/model"

type AdminShopFeedbackEmailDialogProps = {
  shop: AdminShopDTO | null
  visible: boolean
  sending: boolean
  onClose: () => void
  onSubmit: (title: string, content: string) => void
}

type EmailTitleOption = {
  label: string
  value: string
}

const MAX_CONTENT_LENGTH = 2000

const EMAIL_TITLE_OPTIONS: EmailTitleOption[] = [
  {
    label: "Yêu cầu bổ sung thông tin đăng ký shop",
    value: "Yêu cầu bổ sung thông tin đăng ký shop",
  },
  {
    label: "Yêu cầu cập nhật thông tin liên hệ",
    value: "Yêu cầu cập nhật thông tin liên hệ",
  },
  {
    label: "Yêu cầu xác minh địa chỉ shop",
    value: "Yêu cầu xác minh địa chỉ shop",
  },
  {
    label: "Yêu cầu bổ sung giấy phép kinh doanh",
    value: "Yêu cầu bổ sung giấy phép kinh doanh",
  },
  {
    label: "Thông báo hồ sơ đăng ký chưa đủ điều kiện",
    value: "Thông báo hồ sơ đăng ký chưa đủ điều kiện",
  },
]

const DEFAULT_EMAIL_TITLE = EMAIL_TITLE_OPTIONS[0].value

function displayValue(value: string | null | undefined) {
  return value === null || value === undefined || value.trim() === "" ? "Chưa có" : value
}

export function AdminShopFeedbackEmailDialog({
  shop,
  visible,
  sending,
  onClose,
  onSubmit,
}: AdminShopFeedbackEmailDialogProps) {
  const [title, setTitle] = useState(DEFAULT_EMAIL_TITLE)
  const [content, setContent] = useState("")
  const [error, setError] = useState("")
  const trimmedTitle = useMemo(() => title.trim(), [title])
  const trimmedContent = useMemo(() => content.trim(), [content])

  useEffect(() => {
    if (!visible) {
      setTitle(DEFAULT_EMAIL_TITLE)
      setContent("")
      setError("")
    }
  }, [visible])

  const handleSubmit = () => {
    if (!trimmedTitle) {
      setError("Vui lòng chọn tiêu đề email.")
      return
    }

    if (!trimmedContent) {
      setError("Vui lòng nhập nội dung phản hồi.")
      return
    }

    setError("")
    onSubmit(trimmedTitle, trimmedContent)
  }

  return (
    <Dialog
      visible={visible}
      modal
      draggable={false}
      showHeader={false}
      onHide={() => {
        if (!sending) onClose()
      }}
      className="w-[min(720px,calc(100vw-2rem))] overflow-hidden !rounded-lg [&_.p-dialog-content]:!p-0"
    >
      {shop && (
        <div className="bg-white">
          <div className="flex h-12 items-center justify-between bg-[#f2f6fb] px-4">
            <p className="m-0 text-sm font-semibold text-slate-800">Email phản hồi</p>
            <Button
              type="button"
              icon="pi pi-times"
              rounded
              text
              disabled={sending}
              onClick={onClose}
              aria-label="Đóng"
              className="!h-8 !w-8 !text-slate-500 hover:!bg-slate-200/70 hover:!text-slate-800"
            />
          </div>

          <div className="px-4">
            <div className="flex min-h-11 items-center gap-3 border-b border-[#e5eaf1] py-2">
              <span className="w-16 shrink-0 text-sm font-medium text-slate-500">Tới</span>
              <span className="min-w-0 break-words text-sm font-semibold text-slate-800">
                {displayValue(shop.owner?.email)}
              </span>
            </div>

            <div className="flex min-h-11 items-center gap-3 border-b border-[#e5eaf1] py-2">
              <span className="w-16 shrink-0 text-sm font-medium text-slate-500">Shop</span>
              <div className="min-w-0 text-sm text-slate-800">
                <span className="font-semibold">{shop.name}</span>
                <span className="ml-2 text-slate-500">Chủ shop: {displayValue(shop.owner?.fullName)}</span>
              </div>
            </div>

            <div className="flex min-h-12 items-center gap-3 border-b border-[#e5eaf1] py-2">
              <label htmlFor="admin-shop-feedback-title" className="w-16 shrink-0 text-sm font-medium text-slate-500">
                Tiêu đề
              </label>
              <Dropdown
                inputId="admin-shop-feedback-title"
                value={title}
                options={EMAIL_TITLE_OPTIONS}
                optionLabel="label"
                optionValue="value"
                filter
                filterBy="label"
                filterPlaceholder="Tìm tiêu đề"
                emptyFilterMessage="Không tìm thấy tiêu đề"
                disabled={sending}
                onChange={(event) => {
                  setTitle(event.value as string)
                  if (error) setError("")
                }}
                placeholder="Chọn tiêu đề email"
                className="min-w-0 flex-1 !border-none !shadow-none [&_.p-dropdown-label]:!px-0 [&_.p-dropdown-label]:!py-1 [&_.p-dropdown-label]:!text-sm [&_.p-dropdown-label]:!font-semibold [&_.p-dropdown-label]:!text-slate-800 [&_.p-dropdown-trigger]:!w-8"
                panelClassName="text-sm"
              />
            </div>

            <div className="py-3">
              <InputTextarea
                id="admin-shop-feedback-content"
                value={content}
                rows={12}
                autoResize={false}
                maxLength={MAX_CONTENT_LENGTH}
                disabled={sending}
                onChange={(event) => {
                  setContent(event.target.value)
                  if (error) setError("")
                }}
                placeholder="Nhập nội dung cần gửi cho chủ shop..."
                className="min-h-[260px] w-full resize-y !rounded-md !border-[#d8e0ea] !p-3 !text-sm !leading-6 !text-slate-800 !shadow-none outline-none placeholder:!text-slate-400 focus:!border-[#214388] focus:!shadow-none"
              />

              <div className="mt-2 flex min-h-5 items-center justify-between gap-3">
                <p className="m-0 text-xs font-medium text-red-500">{error}</p>
                <p className="m-0 shrink-0 text-xs text-slate-500">
                  {content.length}/{MAX_CONTENT_LENGTH} ký tự
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[#e5eaf1] bg-white px-4 py-3">
            <Button
              type="button"
              label="Gửi"
              icon="pi pi-send"
              loading={sending}
              disabled={!trimmedTitle || !trimmedContent || sending}
              onClick={handleSubmit}
              className="!h-9 !rounded-full !border-[#1a73e8] !bg-[#1a73e8] !px-5 !py-0 !text-sm !font-semibold !text-white hover:!bg-[#1765cc] [&_.p-button-icon]:!text-white [&_.p-button-label]:!text-white"
            />

            <Button
              type="button"
              icon="pi pi-trash"
              rounded
              text
              disabled={sending}
              onClick={onClose}
              aria-label="Hủy"
              className="!h-9 !w-9 !text-slate-500 hover:!bg-slate-100 hover:!text-slate-800"
            />
          </div>
        </div>
      )}
    </Dialog>
  )
}
