import { useEffect, useMemo, useState, type FormEvent } from "react"
import { CalendarDays, PawPrint, Plus, ShieldCheck, Trash2, PencilLine } from "lucide-react"
import { useUserStore } from "@/apps/user/store/UserStore"
import { GATEWAY_URL } from "@/common/config/api"
import { AppDialog } from "@/common/component/AppDialog"

type LocalPetProfile = {
  id: string
  name: string
  speciesName: string
  breedName?: string
  gender?: string
  dob?: string
  note?: string
  avatarUrl?: string
  shopName?: string
}

type PetFormState = {
  name: string
  speciesName: string
  breedName: string
  gender: string
  dob: string
  note: string
  avatarUrl: string
  shopName: string
}

const STORAGE_PREFIX = "petpees:pets:"

const mockPetProfilesByOwner: Record<string, LocalPetProfile[]> = {
  "hieu@gmail.com": [
    {
      id: "pet-01",
      name: "Milo",
      speciesName: "Chó",
      breedName: "Poodle",
      gender: "Đực",
      dob: "2023-08-10",
      note: "Dị ứng nhẹ với thịt bò",
      avatarUrl: "/image/dog.jpg",
      shopName: "PETPEEs Mall",
    },
    {
      id: "pet-02",
      name: "Miu",
      speciesName: "Mèo",
      breedName: "Munchkin",
      gender: "Cái",
      dob: "2022-12-03",
      note: "Cần tắm 2 tuần/lần",
      avatarUrl: "/image/cat.png",
      shopName: "Spa House Official",
    },
  ],
  default: [
    {
      id: "pet-03",
      name: "Bông",
      speciesName: "Chó",
      breedName: "Golden Retriever",
      gender: "Đực",
      dob: "2021-05-20",
      note: "Đã tiêm phòng đầy đủ",
      avatarUrl: "/fluffy-dog-grooming.jpg",
      shopName: "Doggo Planet",
    },
    {
      id: "pet-04",
      name: "Nấm",
      speciesName: "Mèo",
      breedName: "Anh lông ngắn",
      gender: "Cái",
      dob: "2024-02-15",
      note: "Ưu tiên thức ăn hạt mềm",
      avatarUrl: "/cute-cat-after-grooming-spa.jpg",
      shopName: "PETPEEs Mall",
    },
  ],
}

const emptyForm: PetFormState = {
  name: "",
  speciesName: "Chó",
  breedName: "",
  gender: "",
  dob: "",
  note: "",
  avatarUrl: "",
  shopName: "",
}

function resolveImageUrl(url?: string) {
  if (!url) {
    return "/placeholder.jpg"
  }

  if (url.startsWith("http") || url.startsWith("/")) {
    return url
  }

  return `${GATEWAY_URL}${url}`
}

function calculatePetAge(dob?: string) {
  if (!dob) return "Chưa rõ tuổi"

  const birth = new Date(dob)
  if (Number.isNaN(birth.getTime())) {
    return "Chưa rõ tuổi"
  }

  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()

  if (months < 0) {
    years -= 1
    months += 12
  }

  if (years <= 0) {
    return `${Math.max(1, months)} tháng`
  }

  if (months === 0) {
    return `${years} tuổi`
  }

  return `${years} tuổi ${months} tháng`
}

function getStorageKey(ownerKey: string) {
  return `${STORAGE_PREFIX}${ownerKey}`
}

function safeParsePets(raw: string | null): LocalPetProfile[] | null {
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null

    return parsed.filter((item) => typeof item?.id === "string" && typeof item?.name === "string")
  } catch {
    return null
  }
}

function createPetId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `pet-${Date.now()}-${Math.round(Math.random() * 1000)}`
}

export function MyPetsPage() {
  const { user } = useUserStore()
  const ownerKey = user?.email?.trim().toLowerCase() || "default"

  const [petProfiles, setPetProfiles] = useState<LocalPetProfile[]>([])
  const [showFormModal, setShowFormModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingPetId, setEditingPetId] = useState<string | null>(null)
  const [deletePetId, setDeletePetId] = useState<string | null>(null)
  const [formState, setFormState] = useState<PetFormState>(emptyForm)
  const [formError, setFormError] = useState("")

  useEffect(() => {
    const storageKey = getStorageKey(ownerKey)
    const stored = safeParsePets(localStorage.getItem(storageKey))

    if (stored) {
      setPetProfiles(stored)
      return
    }

    setPetProfiles(mockPetProfilesByOwner[ownerKey] ?? mockPetProfilesByOwner.default)
  }, [ownerKey])

  useEffect(() => {
    const storageKey = getStorageKey(ownerKey)
    localStorage.setItem(storageKey, JSON.stringify(petProfiles))
  }, [ownerKey, petProfiles])

  const petSummaryText = useMemo(() => {
    if (petProfiles.length === 0) {
      return "Bạn chưa có hồ sơ thú cưng"
    }
    return `Bạn có ${petProfiles.length} hồ sơ thú cưng`
  }, [petProfiles.length])

  const openCreateForm = () => {
    setEditingPetId(null)
    setFormError("")
    setFormState(emptyForm)
    setShowFormModal(true)
  }

  const openEditForm = (pet: LocalPetProfile) => {
    setEditingPetId(pet.id)
    setFormError("")
    setFormState({
      name: pet.name,
      speciesName: pet.speciesName,
      breedName: pet.breedName || "",
      gender: pet.gender || "",
      dob: pet.dob || "",
      note: pet.note || "",
      avatarUrl: pet.avatarUrl || "",
      shopName: pet.shopName || "",
    })
    setShowFormModal(true)
  }

  const closeForm = () => {
    setShowFormModal(false)
    setEditingPetId(null)
    setFormError("")
    setFormState(emptyForm)
  }

  const savePet = (event: FormEvent) => {
    event.preventDefault()

    const name = formState.name.trim()
    const speciesName = formState.speciesName.trim()

    if (!name || !speciesName) {
      setFormError("Vui lòng nhập tối thiểu Tên thú cưng và Loài.")
      return
    }

    if (editingPetId) {
      setPetProfiles((prev) =>
        prev.map((pet) =>
          pet.id === editingPetId
            ? {
                ...pet,
                name,
                speciesName,
                breedName: formState.breedName.trim() || undefined,
                gender: formState.gender || undefined,
                dob: formState.dob || undefined,
                note: formState.note.trim() || undefined,
                avatarUrl: formState.avatarUrl.trim() || undefined,
                shopName: formState.shopName.trim() || undefined,
              }
            : pet
        )
      )
    } else {
      const newPet: LocalPetProfile = {
        id: createPetId(),
        name,
        speciesName,
        breedName: formState.breedName.trim() || undefined,
        gender: formState.gender || undefined,
        dob: formState.dob || undefined,
        note: formState.note.trim() || undefined,
        avatarUrl: formState.avatarUrl.trim() || undefined,
        shopName: formState.shopName.trim() || undefined,
      }
      setPetProfiles((prev) => [newPet, ...prev])
    }

    closeForm()
  }

  const requestDeletePet = (petId: string) => {
    setDeletePetId(petId)
    setShowDeleteModal(true)
  }

  const confirmDeletePet = () => {
    if (!deletePetId) return
    setPetProfiles((prev) => prev.filter((pet) => pet.id !== deletePetId))
    setDeletePetId(null)
    setShowDeleteModal(false)
  }

  const closeDeleteModal = () => {
    setDeletePetId(null)
    setShowDeleteModal(false)
  }

  return (
    <>
      <div className="border-b border-[#f2f2f2] pb-4">
        <h1 className="text-2xl font-semibold text-slate-800">Thú cưng của tôi</h1>
        <p className="mt-1 text-sm text-slate-500">Quản lý hồ sơ thú cưng cho tài khoản hiện tại.</p>
      </div>

      <div className="pt-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="inline-flex items-center gap-2 text-xl font-semibold text-slate-800">
              <PawPrint className="h-5 w-5 text-[#ee4d2d]" />
              Hồ sơ thú cưng
            </h2>
            <p className="mt-1 text-sm text-slate-500">{petSummaryText}</p>
          </div>

          <button
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 rounded-sm bg-[#ee4d2d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#de4322]"
          >
            <Plus className="h-4 w-4" />
            Thêm thú cưng
          </button>
        </div>

        {petProfiles.length === 0 ? (
          <div className="rounded-sm border border-dashed border-[#d9d9d9] bg-[#fafafa] p-6 text-sm text-slate-600">
            Chưa có dữ liệu hồ sơ thú cưng cho tài khoản này.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {petProfiles.map((pet) => (
              <article key={pet.id} className="rounded-sm border border-[#efefef] p-4">
                <div className="mb-3 flex justify-end gap-2">
                  <button
                    onClick={() => openEditForm(pet)}
                    className="inline-flex items-center gap-1 rounded-sm border border-[#e8e8e8] px-2 py-1 text-xs text-slate-700 hover:bg-[#fafafa]"
                  >
                    <PencilLine className="h-3.5 w-3.5" />
                    Sửa
                  </button>
                  <button
                    onClick={() => requestDeletePet(pet.id)}
                    className="inline-flex items-center gap-1 rounded-sm border border-[#f0c2b7] px-2 py-1 text-xs text-[#c73d1e] hover:bg-[#fff4f1]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Xóa
                  </button>
                </div>

                <div className="flex items-start gap-3">
                  <img
                    src={resolveImageUrl(pet.avatarUrl)}
                    alt={pet.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-semibold text-slate-800">{pet.name}</h3>
                    <p className="text-sm text-slate-500">
                      {pet.speciesName}
                      {pet.breedName ? ` • ${pet.breedName}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Shop: {pet.shopName || "Chưa gắn shop"}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-slate-500" />
                    <span>Giới tính: {pet.gender || "Chưa cập nhật"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-slate-500" />
                    <span>Tuổi: {calculatePetAge(pet.dob)}</span>
                  </div>
                  <div className="rounded-sm bg-[#fafafa] p-2 text-xs text-slate-600">
                    Ghi chú: {pet.note || "Không có"}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <AppDialog
        open={showFormModal}
        onClose={closeForm}
        title={editingPetId ? "Cập nhật thú cưng" : "Tạo hồ sơ thú cưng mới"}
        description="Điền thông tin thú cưng để quản lý lịch sử chăm sóc dễ hơn."
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-sm border border-[#d9d9d9] bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-[#fafafa]"
            >
              Hủy
            </button>
            <button
              type="submit"
              form="pet-form"
              className="rounded-sm bg-[#ee4d2d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#de4322]"
            >
              {editingPetId ? "Lưu thay đổi" : "Tạo mới"}
            </button>
          </>
        }
      >
        <form id="pet-form" onSubmit={savePet}>
          {formError && (
            <div className="mb-3 rounded-sm border border-[#f0c2b7] bg-[#fff4f1] px-3 py-2 text-sm text-[#c73d1e]">
              {formError}
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            <InputField
              label="Tên thú cưng"
              value={formState.name}
              required
              onChange={(value) => setFormState((prev) => ({ ...prev, name: value }))}
            />
            <InputField
              label="Loài"
              value={formState.speciesName}
              required
              onChange={(value) => setFormState((prev) => ({ ...prev, speciesName: value }))}
            />
            <InputField
              label="Giống"
              value={formState.breedName}
              onChange={(value) => setFormState((prev) => ({ ...prev, breedName: value }))}
            />
            <SelectField
              label="Giới tính"
              value={formState.gender}
              options={["", "Đực", "Cái"]}
              onChange={(value) => setFormState((prev) => ({ ...prev, gender: value }))}
            />
            <InputField
              label="Ngày sinh"
              type="date"
              value={formState.dob}
              onChange={(value) => setFormState((prev) => ({ ...prev, dob: value }))}
            />
            <InputField
              label="Shop liên kết"
              value={formState.shopName}
              onChange={(value) => setFormState((prev) => ({ ...prev, shopName: value }))}
            />
            <InputField
              label="Ảnh (URL hoặc /public path)"
              value={formState.avatarUrl}
              onChange={(value) => setFormState((prev) => ({ ...prev, avatarUrl: value }))}
            />
            <TextAreaField
              label="Ghi chú"
              value={formState.note}
              onChange={(value) => setFormState((prev) => ({ ...prev, note: value }))}
            />
          </div>
        </form>
      </AppDialog>

      <AppDialog
        open={showDeleteModal}
        onClose={closeDeleteModal}
        title="Xác nhận xóa thú cưng"
        description="Hành động này sẽ xóa hồ sơ khỏi danh sách của bạn."
        footer={
          <>
            <button
              type="button"
              onClick={closeDeleteModal}
              className="rounded-sm border border-[#d9d9d9] bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-[#fafafa]"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={confirmDeletePet}
              className="rounded-sm bg-[#d93b1f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c23218]"
            >
              Xóa thú cưng
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600">Bạn chắc chắn muốn xóa hồ sơ thú cưng này không?</p>
      </AppDialog>
    </>
  )
}

type InputFieldProps = {
  label: string
  value: string
  required?: boolean
  type?: "text" | "date"
  onChange: (value: string) => void
}

function InputField({ label, value, onChange, required = false, type = "text" }: InputFieldProps) {
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

type TextAreaFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
}

function TextAreaField({ label, value, onChange }: TextAreaFieldProps) {
  return (
    <label className="text-sm text-slate-700 md:col-span-2">
      <div className="mb-1">{label}</div>
      <textarea
        rows={3}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-none rounded-sm border border-[#d9d9d9] bg-white px-3 py-2 text-sm outline-none focus:border-[#ee4d2d]"
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
          <option key={option || "empty"} value={option}>
            {option || "Chọn"}
          </option>
        ))}
      </select>
    </label>
  )
}

