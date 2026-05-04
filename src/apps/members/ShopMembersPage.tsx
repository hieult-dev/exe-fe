import { useCallback, useEffect, useMemo, useState } from "react"
import { Avatar } from "primereact/avatar"
import { Button } from "primereact/button"
import { Column } from "primereact/column"
import type { ColumnBodyOptions } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { Dialog } from "primereact/dialog"
import { Dropdown } from "primereact/dropdown"
import type { MenuItem } from "primereact/menuitem"
import { Toolbar } from "primereact/toolbar"
import { TableActionMenu } from "@/common/component/TableActionMenu"
import { useShopOwnerContext } from "@/common/store/ShopOwnerContext"
import { notify } from "@/common/toast/ToastHelper"
import { formatDateTimeViVN } from "@/common/utils/format"
import { buildUploadPublicUrl } from "@/common/utils/url"
import { deleteShopMember, getShopMemberById, getShopMembers } from "@/apps/members/api/shopMemberApi"
import { ShopMemberForm, type ShopMemberFormMode } from "@/apps/members/components/ShopMemberForm"
import { ShopMemberPasswordDialog } from "@/apps/members/components/ShopMemberPasswordDialog"
import {
  SHOP_MEMBER_ROLE_OPTIONS,
  SHOP_MEMBER_STATUS_OPTIONS,
  getShopMemberDisplayName,
  getShopMemberInitial,
  roleLabel,
  statusClass,
  statusLabel,
  type ShopMemberDTO,
  type ShopMemberRole,
  type ShopMemberStatus,
} from "@/apps/members/model"

type FilterAll = "ALL"
type RoleFilterValue = ShopMemberRole | FilterAll
type StatusFilterValue = ShopMemberStatus | FilterAll

const roleFilterOptions: { label: string; value: RoleFilterValue }[] = [
  { label: "Tất cả vai trò", value: "ALL" },
  ...SHOP_MEMBER_ROLE_OPTIONS,
]

const statusFilterOptions: { label: string; value: StatusFilterValue }[] = [
  { label: "Tất cả trạng thái", value: "ALL" },
  ...SHOP_MEMBER_STATUS_OPTIONS,
]

const dropdownClassName =
  "w-full rounded-lg border border-[#d9e1eb] bg-white text-sm shadow-none focus:!border-[#d9e1eb] focus:!shadow-none [&.p-focus]:!border-[#d9e1eb] [&.p-focus]:!shadow-none [&_.p-dropdown-label]:px-3 [&_.p-dropdown-label]:py-2 [&_.p-dropdown-label]:text-sm [&_.p-dropdown-trigger]:w-10 sm:w-48"

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === "string" && message.trim()) return message
  }
  if (error instanceof Error && error.message.trim()) return error.message
  return fallback
}

function buildSummary(members: ShopMemberDTO[]) {
  return {
    total: members.length,
    active: members.filter((member) => member.status === "ACTIVE").length,
  }
}

export function ShopMembersPage() {
  const { globalSearchQuery } = useShopOwnerContext()
  const [members, setMembers] = useState<ShopMemberDTO[]>([])
  const [roleFilter, setRoleFilter] = useState<RoleFilterValue>("ALL")
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("ALL")
  const [formMode, setFormMode] = useState<ShopMemberFormMode>(null)
  const [formMember, setFormMember] = useState<ShopMemberDTO | null>(null)
  const [passwordTarget, setPasswordTarget] = useState<ShopMemberDTO | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ShopMemberDTO | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadMembers = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await getShopMembers({
        role: roleFilter === "ALL" ? null : roleFilter,
        status: statusFilter === "ALL" ? null : statusFilter,
        keyword: globalSearchQuery,
      })
      setMembers(result)
    } catch (error) {
      notify.error(getErrorMessage(error, "Không tải được danh sách thành viên."))
    } finally {
      setIsLoading(false)
    }
  }, [globalSearchQuery, roleFilter, statusFilter])

  useEffect(() => {
    void loadMembers()
  }, [loadMembers])

  const summary = useMemo(() => buildSummary(members), [members])

  const openCreateForm = () => {
    setFormMember(null)
    setFormMode("CREATE")
  }

  const openEditForm = async (member: ShopMemberDTO) => {
    setIsLoadingDetail(true)
    try {
      const freshMember = await getShopMemberById(member.userId)
      setFormMember(freshMember)
      setFormMode("EDIT")
    } catch (error) {
      notify.error(getErrorMessage(error, "Không tải được thông tin thành viên."))
    } finally {
      setIsLoadingDetail(false)
    }
  }

  const closeForm = () => {
    setFormMember(null)
    setFormMode(null)
  }

  const requestDelete = (member: ShopMemberDTO) => {
    setDeleteTarget(member)
  }

  const requestResetPassword = (member: ShopMemberDTO) => {
    setPasswordTarget(member)
  }

  const closeDeleteDialog = () => {
    if (isDeleting) return
    setDeleteTarget(null)
  }

  const handleMemberSaved = (savedMember: ShopMemberDTO, mode: Exclude<ShopMemberFormMode, null>) => {
    setMembers((prev) => {
      if (mode === "CREATE") {
        return [savedMember, ...prev.filter((member) => member.userId !== savedMember.userId)]
      }

      return prev.map((member) => (member.userId === savedMember.userId ? savedMember : member))
    })
    closeForm()
    void loadMembers()
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return

    setIsDeleting(true)
    try {
      await deleteShopMember(deleteTarget.userId)
      notify.success("Đã xóa thành viên.")
      setDeleteTarget(null)
      await loadMembers()
    } catch (error) {
      notify.error(getErrorMessage(error, "Không xóa được thành viên."))
    } finally {
      setIsDeleting(false)
    }
  }

  const indexBody = (_member: ShopMemberDTO, options: ColumnBodyOptions) => {
    return <div className="w-full text-center">{options.rowIndex + 1}</div>
  }

  const memberBody = (member: ShopMemberDTO) => {
    return (
      <div className="flex w-full items-center gap-3">
        <Avatar
          image={member.avatarUrlPreview ? buildUploadPublicUrl(member.avatarUrlPreview) : undefined}
          label={member.avatarUrlPreview ? undefined : getShopMemberInitial(member)}
          shape="circle"
          className="!h-9 !w-9 !bg-[#e8eef8] !text-xs !font-semibold !text-[#2c4b7a]"
        />
        <div className="min-w-0 text-left">
          <p className="m-0 truncate font-semibold text-[#24364d]">{getShopMemberDisplayName(member)}</p>
        </div>
      </div>
    )
  }

  const centeredText = (value: string | number | null | undefined) => {
    const text = value === null || value === undefined || value === "" ? "—" : String(value)
    return <div className="w-full text-center text-[#4c5f78]">{text}</div>
  }

  const roleBody = (member: ShopMemberDTO) => centeredText(roleLabel(member.role))

  const statusBody = (member: ShopMemberDTO) => {
    return (
      <div className="flex w-full justify-center">
        <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${statusClass(member.status)}`}>
          {statusLabel(member.status)}
        </span>
      </div>
    )
  }

  const dateBody = (member: ShopMemberDTO) => centeredText(formatDateTimeViVN(member.createdAt))

  const actionsBody = (member: ShopMemberDTO) => {
    const actionItems: MenuItem[] = [
      {
        label: "Chỉnh sửa",
        icon: "pi pi-pencil",
        command: () => void openEditForm(member),
      },
      {
        label: "Đặt lại mật khẩu",
        icon: "pi pi-key",
        command: () => requestResetPassword(member),
      },
    ]

    if (member.status !== "REMOVED") {
      actionItems.push({
        label: "Xóa",
        icon: "pi pi-trash",
        className: "text-red-500",
        command: () => requestDelete(member),
      })
    }

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
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Dropdown
                value={roleFilter}
                options={roleFilterOptions}
                optionLabel="label"
                optionValue="value"
                filter
                filterBy="label,value"
                emptyFilterMessage="Không tìm thấy vai trò"
                onChange={(event) => setRoleFilter(event.value)}
                className={dropdownClassName}
              />
              <Dropdown
                value={statusFilter}
                options={statusFilterOptions}
                optionLabel="label"
                optionValue="value"
                filter
                filterBy="label,value"
                emptyFilterMessage="Không tìm thấy trạng thái"
                onChange={(event) => setStatusFilter(event.value)}
                className={dropdownClassName}
              />
              <Button
                type="button"
                label="Làm mới"
                icon="pi pi-refresh"
                loading={isLoading}
                onClick={() => void loadMembers()}
                className="!h-9 !rounded-md !border-none !bg-white !px-3 !py-0 !text-sm !font-semibold !text-[#40526b] hover:!bg-[#f4f7fb] [&_.p-button-icon]:!text-[#40526b] [&_.p-button-label]:!text-[#40526b]"
              />
              <Button
                type="button"
                label="Thêm thành viên"
                icon="pi pi-plus"
                onClick={openCreateForm}
                disabled={isLoadingDetail}
                className="!h-9 !rounded-md !border-[#214388] !bg-[#214388] !px-4 !py-0 !text-sm !font-semibold !text-white hover:!bg-[#19356a] [&_.p-button-icon]:!text-white [&_.p-button-label]:!text-white"
              />
            </div>
          }
        />

        <div className="flex-1 rounded-xl bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.05)] lg:p-4">
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <StatCard icon="pi pi-users" label="Tổng thành viên" value={summary.total.toString()} color="blue" />
              <StatCard icon="pi pi-check-circle" label="Đang hoạt động" value={summary.active.toString()} color="emerald" />
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#24364d]">Danh sách thành viên</p>
                <p className="text-sm text-[#73849b]">Theo dõi thông tin liên hệ, vai trò và trạng thái của từng thành viên.</p>
              </div>
              <p className="text-sm text-[#73849b]">Hiển thị {members.length} mục</p>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">
              <DataTable
                value={members}
                dataKey="userId"
                size="small"
                stripedRows
                rowHover
                showGridlines
                loading={isLoading}
                tableStyle={{ width: "100%" }}
                emptyMessage={<div className="w-full py-2 text-center text-[#4c5f78]">Chưa có thành viên nào.</div>}
              >
                <Column header="TT" body={indexBody} style={{ width: "4rem" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                <Column field="userFullName" header="Thành viên" body={memberBody} style={{ width: "20%" }} alignHeader="left" />
                <Column field="userEmail" header="Email" body={(member) => centeredText((member as ShopMemberDTO).userEmail)} style={{ width: "23%" }} alignHeader="center" />
                <Column field="role" header="Vai trò" body={roleBody} style={{ width: "11%" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                <Column
                  field="userPhone"
                  header="Số điện thoại"
                  body={(member) => centeredText((member as ShopMemberDTO).userPhone)}
                  style={{ width: "13%" }}
                  alignHeader="center"
                />
                <Column field="status" header="Trạng thái" body={statusBody} style={{ width: "14%" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                <Column field="createdAt" header="Ngày thêm" body={dateBody} style={{ width: "14%" }} alignHeader="center" />
                <Column header="Thao tác" body={actionsBody} style={{ width: "5.5rem" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
              </DataTable>
            </div>
          </div>
        </div>
      </div>

      <ShopMemberForm mode={formMode} member={formMember} onClose={closeForm} onSaved={handleMemberSaved} />

      <ShopMemberPasswordDialog
        member={passwordTarget}
        onClose={() => setPasswordTarget(null)}
        onReset={() => void loadMembers()}
      />

      <Dialog
        visible={deleteTarget !== null}
        onHide={closeDeleteDialog}
        header="Xác nhận xóa thành viên"
        style={{ width: "100%", maxWidth: "30rem" }}
        footer={
          <div className="mt-4 flex w-full flex-col-reverse items-center justify-center gap-2 sm:flex-row">
            <Button
              type="button"
              label="Hủy"
              onClick={closeDeleteDialog}
              disabled={isDeleting}
              className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border !border-[#d9e1eb] !bg-white !px-4 !py-0 !text-sm !font-semibold !text-[#40526b] hover:!bg-[#f8fafc]"
            />
            <Button
              type="button"
              label="Xóa thành viên"
              icon="pi pi-trash"
              onClick={confirmDelete}
              loading={isDeleting}
              className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border !border-[#d93b1f] !bg-[#d93b1f] !px-4 !py-0 !text-sm !font-semibold !text-white hover:!bg-[#c23218] [&_.p-button-icon]:!text-white [&_.p-button-label]:!text-white"
            />
          </div>
        }
      >
        <p className="mb-2 mt-0 text-sm text-[#73849b]">Backend sẽ chuyển trạng thái thành viên sang Đã xóa.</p>
        <p className="text-sm text-slate-600">
          Bạn chắc chắn muốn xóa {deleteTarget ? getShopMemberDisplayName(deleteTarget) : "thành viên này"}?
        </p>
      </Dialog>
    </>
  )
}

type StatCardProps = {
  icon: string
  label: string
  value: string
  color: "blue" | "emerald"
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const borderMap = {
    blue: "border-sky-200",
    emerald: "border-emerald-200",
  }
  const bgMap = {
    blue: "bg-sky-50",
    emerald: "bg-emerald-50",
  }
  const iconColorMap = {
    blue: "text-sky-500",
    emerald: "text-emerald-500",
  }

  return (
    <div className={`rounded-xl border ${borderMap[color]} ${bgMap[color]} p-4`}>
      <div className="mb-2 flex items-center gap-2">
        <i className={`${icon} h-5 w-5 ${iconColorMap[color]}`} />
        <p className="text-sm text-slate-600">{label}</p>
      </div>
      <p className="text-3xl font-bold leading-none text-[#24364d]">{value}</p>
    </div>
  )
}
