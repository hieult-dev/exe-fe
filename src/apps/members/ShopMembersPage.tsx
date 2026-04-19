import { useState, type FormEvent } from "react"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Toolbar } from "primereact/toolbar"
import { TableActionMenu } from "@/common/component/TableActionMenu"
import type { ColumnBodyOptions } from "primereact/column"
import { Dialog } from "primereact/dialog"
import { useShopOwnerContext } from "@/common/store/ShopOwnerContext"
import {
  createLocalId,
  type ShopMember,
  type ShopMemberRole,
  type ShopMemberStatus,
} from "@/common/store/shopOwnerStore"

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
  if (status === "ACTIVE") return "bg-emerald-500 text-white"
  if (status === "INVITED") return "bg-sky-500 text-white"
  if (status === "INACTIVE") return "bg-slate-200 text-slate-700"
  return "bg-rose-500 text-white"
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

  const indexBody = (_member: ShopMember, options: ColumnBodyOptions) => {
    return <div className="w-full text-center">{options.rowIndex + 1}</div>
  }

  const memberBody = (member: ShopMember) => {
    const initial = (member.fullName.trim()[0] || "U").toUpperCase()

    return (
      <div className="flex w-full flex-row items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e8eef8] text-xs font-semibold text-[#2c4b7a]">
          {initial}
        </div>
        <div className="text-left">
          <p className="font-semibold text-slate-800">{member.fullName}</p>
          <p className="text-xs text-slate-500">{member.id}</p>
        </div>
      </div>
    )
  }

  const emailBody = (member: ShopMember) => {
    return <div className="w-full text-center">{member.email}</div>
  }

  const roleBody = (member: ShopMember) => {
    return <div className="w-full text-center">{roleLabel(member.role)}</div>
  }

  const phoneBody = (member: ShopMember) => {
    return <div className="w-full text-center">{member.phone || "Chưa cập nhật"}</div>
  }

  const statusBody = (member: ShopMember) => {
    return (
      <div className="flex w-full justify-center">
        <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${statusClass(member.status)}`}>
          {statusLabel(member.status)}
        </span>
      </div>
    )
  }

  const actionsBody = (member: ShopMember) => {
    const actionItems = [
      {
        label: "Chỉnh sửa",
        icon: "pi pi-pencil",
        command: () => openEditDialog(member),
      },
      {
        label: "Xóa",
        icon: "pi pi-trash",
        className: "text-red-500",
        command: () => requestDelete(member.id),
      },
    ]

    return <TableActionMenu items={actionItems} />
  }

  return (
    <>
    <div className="flex flex-1 flex-col gap-2">
      <Toolbar
        className="rounded-xl border-none bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]"
        start={
          <div>
            <h1 className="text-lg font-semibold text-slate-800">Quản lý thành viên</h1>
            <p className="mt-0.5 text-sm text-slate-500">Thêm, sửa, xóa hội viên, quản lý, nhân viên của shop.</p>
          </div>
        }
        end={
          <button
            onClick={openCreateDialog}
            className="inline-flex items-center gap-2 rounded-md bg-[#ee4d2d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#de4322]"
          >
            <i className="pi pi-plus h-4 w-4" />
            Thêm thành viên
          </button>
        }
      />

      <div className="flex-1 rounded-xl bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.05)] lg:p-4">
        <div className="rounded-sm border border-[#d9e1ec] bg-white">
          <DataTable
            value={data.members}
            dataKey="id"
            size="small"
            stripedRows
            showGridlines
            tableStyle={{ minWidth: "62rem" }}
            emptyMessage="Chưa có thành viên nào."
          >
            <Column
              header="TT"
              body={indexBody}
              style={{ width: "64px" }}
              alignHeader="center"
              bodyStyle={{ textAlign: "center" }}
            />
            <Column
              field="fullName"
              header="Thành viên"
              body={memberBody}
              style={{ minWidth: "240px" }}
              alignHeader="left"
            />
            <Column field="email" header="Email" body={emailBody} style={{ minWidth: "220px" }} alignHeader="center" />
            <Column field="role" header="Vai trò" body={roleBody} style={{ minWidth: "120px" }} alignHeader="center" />
            <Column
              field="phone"
              header="Số điện thoại"
              body={phoneBody}
              style={{ minWidth: "140px" }}
              alignHeader="center"
            />
            <Column
              field="status"
              header="Trạng thái"
              body={statusBody}
              style={{ minWidth: "140px" }}
              alignHeader="center"
              bodyStyle={{ textAlign: "center" }}
            />
            <Column
              header="Thao tác"
              body={actionsBody}
              style={{ minWidth: "120px" }}
              alignHeader="center"
              bodyStyle={{ textAlign: "center" }}
            />
          </DataTable>
        </div>
      </div>
    </div>

      <Dialog
        visible={isFormOpen}
        onHide={closeFormDialog}
        header={editingMemberId ? "Cập nhật thành viên" : "Thêm thành viên mới"}
        style={{ width: '100%', maxWidth: '32rem' }}
        footer={
          <div className="flex justify-end gap-2 mt-4">
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
          </div>
        }
      >
        <p className="mb-4 mt-0 text-sm text-[#73849b]">Quản lý hội viên, quản lý và nhân viên làm việc trong shop.</p>
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
      </Dialog>
      <Dialog
        visible={isDeleteOpen}
        onHide={closeDeleteDialog}
        header="Xác nhận xóa thành viên"
        style={{ width: '100%', maxWidth: '30rem' }}
        footer={
          <div className="flex justify-end gap-2 mt-4">
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
          </div>
        }
      >
        <p className="mb-2 mt-0 text-sm text-[#73849b]">Thành viên bị xóa sẽ không còn quyền quản lý trong shop.</p>
        <p className="text-sm text-slate-600">Bạn chắc chắn muốn xóa thành viên này?</p>
      </Dialog>
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

function InputField({ label, value, type = "text", onChange }: InputFieldProps) {
  return (
    <label className="text-sm text-slate-700">
      <div className="mb-1">{label}</div>
      <input
        type={type}
        value={value}
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
