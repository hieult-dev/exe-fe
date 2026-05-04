import { useEffect, useState, type ReactNode } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Avatar } from "primereact/avatar"
import { Button } from "primereact/button"
import { Dropdown } from "primereact/dropdown"
import { InputText } from "primereact/inputtext"
import { Sidebar } from "primereact/sidebar"
import { useForm, type Resolver } from "react-hook-form"
import { SidebarConfig } from "@/common/config/sidebar.config"
import { notify } from "@/common/toast/ToastHelper"
import { buildUploadPublicUrl } from "@/common/utils/url"
import { createShopMember, updateShopMember } from "@/apps/members/api/shopMemberApi"
import {
  SHOP_MEMBER_ROLE_OPTIONS,
  SHOP_MEMBER_STATUS_OPTIONS,
  ShopMemberFormSchema,
  ShopMemberUpdateFormSchema,
  emptyShopMemberForm,
  getShopMemberDisplayName,
  getShopMemberInitial,
  toShopMemberForm,
  type ShopMemberDTO,
  type ShopMemberFormValues,
  type ShopMemberUpdateRequest,
} from "@/apps/members/model"

export type ShopMemberFormMode = "CREATE" | "EDIT" | null

type ShopMemberFormProps = {
  mode: ShopMemberFormMode
  member: ShopMemberDTO | null
  onClose: () => void
  onSaved: (member: ShopMemberDTO, mode: Exclude<ShopMemberFormMode, null>) => void
}

type FormFieldProps = {
  label: string
  required?: boolean
  error?: string
  children: ReactNode
}

const inputClassName =
  "w-full rounded-lg border border-transparent bg-[#f8fafc] px-3 py-2 text-sm text-[#24364d] outline-none focus:!border-[#d9e1eb] focus:!bg-white focus:!shadow-none focus:!ring-0 read-only:cursor-not-allowed read-only:text-[#73849b]"

const dropdownClassName =
  "w-full rounded-lg border border-transparent bg-[#f8fafc] text-sm shadow-none focus:!border-[#d9e1eb] focus:!shadow-none focus:!ring-0 [&.p-focus]:!border-[#d9e1eb] [&.p-focus]:!shadow-none [&_.p-dropdown-label]:px-3 [&_.p-dropdown-label]:py-2 [&_.p-dropdown-label]:text-sm [&_.p-dropdown-trigger]:w-10"

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === "string" && message.trim()) return message
  }
  if (error instanceof Error && error.message.trim()) return error.message
  return fallback
}

export function ShopMemberForm({ mode, member, onClose, onSaved }: ShopMemberFormProps) {
  const [formError, setFormError] = useState("")
  const {
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ShopMemberFormValues>({
    resolver: zodResolver(mode === "EDIT" ? ShopMemberUpdateFormSchema : ShopMemberFormSchema) as unknown as Resolver<ShopMemberFormValues>,
    defaultValues: emptyShopMemberForm,
    mode: "onSubmit",
    reValidateMode: "onChange",
  })

  const isOpen = mode === "CREATE" || mode === "EDIT"
  const role = watch("role")
  const status = watch("status")

  useEffect(() => {
    setFormError("")

    if (mode === "EDIT" && member) {
      reset(toShopMemberForm(member))
      return
    }

    if (mode === "CREATE") {
      reset(emptyShopMemberForm)
    }
  }, [member, mode, reset])

  const onSubmit = async (values: ShopMemberFormValues) => {
    if (!mode) return

    setFormError("")

    try {
      if (mode === "CREATE") {
        const address = values.address.trim()
        const age = values.age.trim()
        const savedMember = await createShopMember({
          fullName: values.fullName.trim(),
          email: values.email.trim().toLowerCase(),
          password: values.password,
          phone: values.phone.trim(),
          ...(address ? { address } : {}),
          ...(age ? { age: Number(age) } : {}),
          role: values.role,
          status: values.status,
        })
        notify.success("Đã thêm thành viên.")
        onSaved(savedMember, mode)
        return
      }

      if (!member) return

      const request: ShopMemberUpdateRequest = {}
      if (values.role !== member.role) request.role = values.role
      if (values.status !== member.status) request.status = values.status

      if (!request.role && !request.status) {
        setFormError("Vui lòng thay đổi vai trò hoặc trạng thái trước khi lưu.")
        return
      }

      const savedMember = await updateShopMember(member.userId, request)
      notify.success("Đã cập nhật thành viên.")
      onSaved(savedMember, mode)
    } catch (error) {
      const message = getErrorMessage(error, mode === "EDIT" ? "Không cập nhật được thành viên." : "Không thêm được thành viên.")
      setFormError(message)
      notify.error(message)
    }
  }

  return (
    <Sidebar
      visible={isOpen}
      position="right"
      onHide={onClose}
      showCloseIcon={false}
      className={SidebarConfig.sizes.DEFAULT}
    >
      <div className="flex h-full flex-col">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              icon="pi pi-arrow-left"
              aria-label="Đóng form thành viên"
              onClick={onClose}
              className="!flex !h-9 !w-9 !items-center !justify-center !rounded-lg !border-none !bg-[#fee2e2] !p-0 !text-[#b42318] hover:!bg-[#fecaca] [&_.p-button-icon]:!text-sm [&_.p-button-icon]:!text-[#b42318]"
            />
            <h2 className="m-0 text-xl font-bold text-[#24364d]">{mode === "EDIT" ? "Cập nhật thành viên" : "Thêm thành viên mới"}</h2>
          </div>
          <p className="mt-1 text-sm text-[#73849b]">
            {mode === "EDIT" ? "Cập nhật vai trò và trạng thái làm việc trong shop." : "Tạo tài khoản nhân viên và phân quyền trong shop."}
          </p>
        </div>

        <form id="shop-member-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 space-y-4 overflow-y-auto pb-20 pr-2">
          {formError && <div className="rounded-lg bg-[#fff4f1] px-3 py-2 text-sm text-[#c73d1e]">{formError}</div>}

          {mode === "EDIT" && member && (
            <div className="flex items-center gap-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3">
              <Avatar
                image={member.avatarUrlPreview ? buildUploadPublicUrl(member.avatarUrlPreview) : undefined}
                label={member.avatarUrlPreview ? undefined : getShopMemberInitial(member)}
                shape="circle"
                className="!h-11 !w-11 !bg-[#e8eef8] !text-sm !font-semibold !text-[#2c4b7a]"
              />
              <div className="min-w-0">
                <p className="m-0 truncate text-sm font-semibold text-[#24364d]">{getShopMemberDisplayName(member)}</p>
                <p className="m-0 truncate text-xs text-[#73849b]">
                  User #{member.userId} · {member.userEmail || "Chưa có email"}
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {mode === "CREATE" && (
              <>
                <FormField label="Họ và tên" required error={errors.fullName?.message}>
                  <InputText {...register("fullName")} className={inputClassName} />
                </FormField>

                <FormField label="Email" required error={errors.email?.message}>
                  <InputText type="email" {...register("email")} className={inputClassName} />
                </FormField>

                <FormField label="Mật khẩu ban đầu" required error={errors.password?.message}>
                  <InputText {...register("password")} className={inputClassName} />
                </FormField>

                <FormField label="Số điện thoại" required error={errors.phone?.message}>
                  <InputText {...register("phone")} className={inputClassName} />
                </FormField>

                <FormField label="Địa chỉ" error={errors.address?.message}>
                  <InputText {...register("address")} className={inputClassName} />
                </FormField>

                <FormField label="Tuổi" error={errors.age?.message}>
                  <InputText inputMode="numeric" {...register("age")} className={inputClassName} />
                </FormField>
              </>
            )}

            <FormField label="Vai trò" required error={errors.role?.message}>
              <Dropdown
                value={role}
                options={SHOP_MEMBER_ROLE_OPTIONS}
                optionLabel="label"
                optionValue="value"
                filter
                filterBy="label,value"
                emptyFilterMessage="Không tìm thấy vai trò"
                onChange={(event) => setValue("role", event.value, { shouldDirty: true, shouldValidate: true })}
                className={dropdownClassName}
              />
            </FormField>

            <FormField label="Trạng thái" required error={errors.status?.message}>
              <Dropdown
                value={status}
                options={SHOP_MEMBER_STATUS_OPTIONS}
                optionLabel="label"
                optionValue="value"
                filter
                filterBy="label,value"
                emptyFilterMessage="Không tìm thấy trạng thái"
                onChange={(event) => setValue("status", event.value, { shouldDirty: true, shouldValidate: true })}
                className={dropdownClassName}
              />
            </FormField>
          </div>
        </form>

        <div className="mt-auto flex items-center justify-center gap-3 border-t border-[#e2e8f0] bg-white pb-4 pt-4">
          <Button
            type="button"
            label="Hủy"
            onClick={onClose}
            disabled={isSubmitting}
            className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border-none !bg-[#f4f7fb] !px-4 !py-0 !text-sm !font-medium !text-slate-700 hover:!bg-[#ecf1f8]"
          />
          <Button
            type="submit"
            form="shop-member-form"
            label={mode === "EDIT" ? "Lưu thay đổi" : "Thêm thành viên"}
            loading={isSubmitting}
            className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border-none !bg-[#214388] !px-4 !py-0 !text-sm !font-semibold !text-white hover:!bg-[#19356a] [&_.p-button-label]:!text-white"
          />
        </div>
      </div>
    </Sidebar>
  )
}

function FormField({ label, required, error, children }: FormFieldProps) {
  return (
    <label className="block text-sm text-slate-700">
      <div className="mb-1">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </div>
      {children}
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </label>
  )
}
