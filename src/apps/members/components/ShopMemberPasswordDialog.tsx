import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "primereact/button"
import { Dialog } from "primereact/dialog"
import { InputText } from "primereact/inputtext"
import { useForm } from "react-hook-form"
import { notify } from "@/common/toast/ToastHelper"
import { resetShopMemberPassword } from "@/apps/members/api/shopMemberApi"
import {
  ShopMemberResetPasswordSchema,
  getShopMemberDisplayName,
  type ShopMemberDTO,
  type ShopMemberResetPasswordValues,
} from "@/apps/members/model"

type ShopMemberPasswordDialogProps = {
  member: ShopMemberDTO | null
  onClose: () => void
  onReset: () => void
}

const inputClassName =
  "w-full rounded-lg border border-transparent bg-[#f8fafc] px-3 py-2 text-sm text-[#24364d] outline-none focus:!border-[#d9e1eb] focus:!bg-white focus:!shadow-none focus:!ring-0"

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === "string" && message.trim()) return message
  }
  if (error instanceof Error && error.message.trim()) return error.message
  return fallback
}

export function ShopMemberPasswordDialog({ member, onClose, onReset }: ShopMemberPasswordDialogProps) {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShopMemberResetPasswordValues>({
    resolver: zodResolver(ShopMemberResetPasswordSchema),
    defaultValues: { newPassword: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
  })

  useEffect(() => {
    if (member) reset({ newPassword: "" })
  }, [member, reset])

  const onSubmit = async (values: ShopMemberResetPasswordValues) => {
    if (!member) return

    try {
      await resetShopMemberPassword(member.userId, { newPassword: values.newPassword })
      notify.success("Đã đặt lại mật khẩu.")
      onReset()
      onClose()
    } catch (error) {
      notify.error(getErrorMessage(error, "Không đặt lại được mật khẩu."))
    }
  }

  return (
    <Dialog
      visible={member !== null}
      onHide={onClose}
      header="Đặt lại mật khẩu"
      style={{ width: "100%", maxWidth: "30rem" }}
      footer={
        <div className="mt-4 flex w-full flex-col-reverse items-center justify-center gap-2 sm:flex-row">
          <Button
            type="button"
            label="Hủy"
            onClick={onClose}
            disabled={isSubmitting}
            className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border !border-[#d9e1eb] !bg-white !px-4 !py-0 !text-sm !font-semibold !text-[#40526b] hover:!bg-[#f8fafc]"
          />
          <Button
            type="submit"
            form="shop-member-reset-password-form"
            label="Lưu mật khẩu"
            icon="pi pi-key"
            loading={isSubmitting}
            className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border-none !bg-[#214388] !px-4 !py-0 !text-sm !font-semibold !text-white hover:!bg-[#19356a] [&_.p-button-icon]:!text-white [&_.p-button-label]:!text-white"
          />
        </div>
      }
    >
      <form id="shop-member-reset-password-form" onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <p className="m-0 text-sm text-[#73849b]">
          Thành viên: <span className="font-semibold text-[#24364d]">{member ? getShopMemberDisplayName(member) : ""}</span>
        </p>
        <label className="block text-sm text-slate-700">
          <div className="mb-1">
            Mật khẩu mới <span className="text-rose-500">*</span>
          </div>
          <InputText {...register("newPassword")} className={inputClassName} />
          {errors.newPassword?.message && <p className="mt-1 text-xs text-rose-500">{errors.newPassword.message}</p>}
        </label>
      </form>
    </Dialog>
  )
}
