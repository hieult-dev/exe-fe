import { useState, type FormEvent } from "react"
import { Plus, PencilLine, Trash2, UserCog, UserRound } from "lucide-react"
import { AppDialog } from "@/common/component/AppDialog"
import { useShopOwnerContext } from "@/common/home/page/features/shop-owner/store/ShopOwnerContext"
import {
  createLocalId,
  type ShopMember,
  type ShopMemberRole,
  type ShopMemberStatus,
} from "@/common/home/page/features/shop-owner/store/shopOwnerStore"

type MemberFormState = {
  fullName: string
  email: string
  phone: string
  role: ShopMemberRole
  status: ShopMemberStatus
}

const emptyForm: MemberFormState = {
  fullName: "",
  email: "",
  phone: "",
  role: "STAFF",
  status: "ACTIVE",
}

function roleLabel(role: ShopMemberRole) {
  if (role === "OWNER") return "Chủ shop"
  if (role === "MANAGER") return "Quản lý"
  return "Nhân viên"
}

function statusLabel(status: ShopMemberStatus) {
  if (status === "ACTIVE") return "Đang hoạt động"
  if (status === "INACTIVE") return "Tạm nghỉ"
  if (status === "INVITED") return "Đã mời"
  return "Đã xóa"
}

function statusClass(status: ShopMemberStatus) {
  if (status === "ACTIVE") return "bg-emerald-50 text-emerald-700"
  if (status === "INVITED") return "bg-sky-50 text-sky-700"
  if (status === "INACTIVE") return "bg-slate-100 text-slate-600"
  return "bg-rose-50 text-rose-700"
}

function toForm(member: ShopMember): MemberFormState {
  return {
    fullName: member.fullName,
    email: member.email,
    phone: member.phone || "",
    role: member.role,
    status: member.status,
  }
}

export function ShopMembersPage() {
  const { data, setMembers } = useShopOwnerContext()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null)
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null)
  const [formState, setFormState] = useState<MemberFormState>(emptyForm)
  const [formError, setFormError] = useState("")

  const openCreateDialog = () => {
    setEditingMemberId(null)
    setFormState(emptyForm)
    setFormError("")
    setIsFormOpen(true)
  }

  const openEditDialog = (member: ShopMember) => {
    setEditingMemberId(member.id)
    setFormState(toForm(member))
    setFormError("")
    setIsFormOpen(true)
  }

  const closeFormDialog = () => {
    setEditingMemberId(null)
    setFormState(emptyForm)
    setFormError("")
    setIsFormOpen(false)
  }

  const handleSave = (event: FormEvent) => {
    event.preventDefault()

    const fullName = formState.fullName.trim()
    const email = formState.email.trim().toLowerCase()

    if (!fullName || !email) {
      setFormError("Vui lòng nhập họ tên và email thành viên.")
      return
    }

    const duplicated = data.members.find(
      (member) => member.email.toLowerCase() === email && member.id !== editingMemberId
    )

    if (duplicated) {
      setFormError("Email này đã tồn tại trong shop.")
      return
    }

    if (editingMemberId) {
      setMembers(
        data.members.map((member) =>
          member.id === editingMemberId
            ? {
                ...member,
                fullName,
                email,
                phone: formState.phone.trim() || undefined,
                role: formState.role,
                status: formState.status,
              }
            : member
        )
      )
    } else {
      const newMember: ShopMember = {
        id: createLocalId("member"),
        fullName,
        email,
        phone: formState.phone.trim() || undefined,
        role: formState.role,
        status: formState.status,
      }
      setMembers([newMember, ...data.members])
    }

    closeFormDialog()
  }

  const requestDelete = (memberId: string) => {
    setDeletingMemberId(memberId)
    setIsDeleteOpen(true)
  }

  const closeDeleteDialog = () => {
    setDeletingMemberId(null)
    setIsDeleteOpen(false)
  }

  const confirmDelete = () => {
    if (!deletingMemberId) return
    setMembers(data.members.filter((member) => member.id !== deletingMemberId))
    closeDeleteDialog()
  }

  return (
    <>
      <div className="border-b border-[#f2f2f2] pb-4">
        <h1 className="text-2xl font-semibold text-slate-800">Quản lý thành viên</h1>
        <p className="mt-1 text-sm text-slate-500">Thêm, sửa, xóa hội viên/quản lý/nhân viên của shop.</p>
      </div>

      <div className="pt-5">
        <div className="mb-4 flex justify-end">
          <button
            onClick={openCreateDialog}
            className="inline-flex items-center gap-2 rounded-sm bg-[#ee4d2d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#de4322]"
          >
            <Plus className="h-4 w-4" />
            Thêm thành viên
          </button>
        </div>

        <div className="space-y-3">
          {data.members.map((member) => (
            <article key={member.id} className="rounded-sm border border-[#efefef] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#f5f5f5] pb-3">
                <div>
                  <h3 className="inline-flex items-center gap-2 text-base font-semibold text-slate-800">
                    <UserRound className="h-4 w-4 text-slate-500" />
                    {member.fullName}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">{member.email}</p>
                </div>

                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass(member.status)}`}>
                  {statusLabel(member.status)}
                </span>
              </div>

              <div className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
                <p className="inline-flex items-center gap-2">
                  <UserCog className="h-4 w-4 text-slate-500" />
                  Vai trò: <span className="font-semibold">{roleLabel(member.role)}</span>
                </p>
                <p>SĐT: <span className="font-semibold">{member.phone || "Chưa cập nhật"}</span></p>
              </div>

              <div className="mt-3 flex flex-wrap justify-end gap-2">
                <button
                  onClick={() => openEditDialog(member)}
                  className="inline-flex items-center gap-1 rounded-sm border border-[#e8e8e8] px-2 py-1 text-xs text-slate-700 hover:bg-[#fafafa]"
                >
                  <PencilLine className="h-3.5 w-3.5" />
                  Sửa
                </button>
                <button
                  onClick={() => requestDelete(member.id)}
                  className="inline-flex items-center gap-1 rounded-sm border border-[#f0c2b7] px-2 py-1 text-xs text-[#c73d1e] hover:bg-[#fff4f1]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Xóa
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <AppDialog
        open={isFormOpen}
        onClose={closeFormDialog}
        title={editingMemberId ? "Cập nhật thành viên" : "Thêm thành viên mới"}
        description="Quản lý hội viên, quản lý và nhân viên làm việc trong shop."
        footer={
          <>
            <button
              type="button"
              onClick={closeFormDialog}
              className="rounded-sm border border-[#d9d9d9] bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-[#fafafa]"
            >
              Hủy
            </button>
            <button
              type="submit"
              form="shop-member-form"
              className="rounded-sm bg-[#ee4d2d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#de4322]"
            >
              {editingMemberId ? "Lưu thay đổi" : "Tạo thành viên"}
            </button>
          </>
        }
      >
        <form id="shop-member-form" onSubmit={handleSave} className="space-y-3">
          {formError && (
            <div className="rounded-sm border border-[#f0c2b7] bg-[#fff4f1] px-3 py-2 text-sm text-[#c73d1e]">{formError}</div>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            <InputField
              label="Họ và tên"
              value={formState.fullName}
              required
              onChange={(value) => setFormState((prev) => ({ ...prev, fullName: value }))}
            />
            <InputField
              label="Email"
              type="email"
              value={formState.email}
              required
              onChange={(value) => setFormState((prev) => ({ ...prev, email: value }))}
            />
            <InputField
              label="Số điện thoại"
              value={formState.phone}
              onChange={(value) => setFormState((prev) => ({ ...prev, phone: value }))}
            />
            <SelectField
              label="Vai trò"
              value={formState.role}
              options={["OWNER", "MANAGER", "STAFF"]}
              onChange={(value) => setFormState((prev) => ({ ...prev, role: value as ShopMemberRole }))}
            />
            <SelectField
              label="Trạng thái"
              value={formState.status}
              options={["ACTIVE", "INACTIVE", "INVITED", "REMOVED"]}
              onChange={(value) => setFormState((prev) => ({ ...prev, status: value as ShopMemberStatus }))}
            />
          </div>
        </form>
      </AppDialog>

      <AppDialog
        open={isDeleteOpen}
        onClose={closeDeleteDialog}
        title="Xác nhận xóa thành viên"
        description="Thành viên bị xóa sẽ không còn quyền quản lý trong shop."
        footer={
          <>
            <button
              type="button"
              onClick={closeDeleteDialog}
              className="rounded-sm border border-[#d9d9d9] bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-[#fafafa]"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="rounded-sm bg-[#d93b1f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c23218]"
            >
              Xóa thành viên
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600">Bạn chắc chắn muốn xóa thành viên này?</p>
      </AppDialog>
    </>
  )
}

type InputFieldProps = {
  label: string
  value: string
  required?: boolean
  type?: "text" | "email"
  onChange: (value: string) => void
}

function InputField({ label, value, required = false, type = "text", onChange }: InputFieldProps) {
  return (
    <label className="text-sm text-slate-700">
      <div className="mb-1">{label}</div>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-sm border border-[#d9d9d9] bg-white px-3 py-2 text-sm outline-none focus:border-[#ee4d2d]"
      />
    </label>
  )
}

type SelectFieldProps = {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}

function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <label className="text-sm text-slate-700">
      <div className="mb-1">{label}</div>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-sm border border-[#d9d9d9] bg-white px-3 py-2 text-sm outline-none focus:border-[#ee4d2d]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

