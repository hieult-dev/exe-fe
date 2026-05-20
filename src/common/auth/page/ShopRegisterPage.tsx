import { useEffect, useState } from "react"
import { MapContainer, TileLayer, CircleMarker, useMapEvents } from "react-leaflet"
import type { LeafletMouseEvent } from "leaflet"
import "leaflet/dist/leaflet.css"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AuthLayout } from "@/common/auth/page/AuthLayout"
import { Button } from "primereact/button"
import { Dialog } from "primereact/dialog"
import { notify } from "@/common/toast/ToastHelper"
import { register as registerApi } from "@/common/auth/api/authApi"
import { getBrowserGeoLocation } from "@/common/utils/location"

export function ShopRegisterPage() {
    const navigate = useNavigate()

    const onLogin = () => navigate("/login")

    const shopRegisterSchema = z.object({
        email: z.string().min(1, "Vui lòng nhập email.").email("Email không hợp lệ."),
        password: z.string().min(6, "Mật khẩu phải từ 6-32 ký tự.").max(32, "Mật khẩu phải từ 6-32 ký tự."),
        fullName: z.string().min(1, "Vui lòng nhập tên."),
        phone: z.string().min(1, "Vui lòng nhập số điện thoại."),
        shopName: z.string().min(1, "Vui lòng nhập tên shop."),
        shopAddressText: z.string().min(1, "Vui lòng nhập địa chỉ shop."),
        locationSource: z.enum(["MANUAL", "BROWSER_GEO", "PLACE_PICKER"]),
        lat: z
            .string()
            .min(1, "Vui lòng nhập vĩ độ.")
            .refine(
                (value) => !Number.isNaN(Number(value)) && Number(value) >= -90 && Number(value) <= 90,
                { message: "Vĩ độ phải từ -90 đến 90." }
            ),
        lng: z
            .string()
            .min(1, "Vui lòng nhập kinh độ.")
            .refine(
                (value) => !Number.isNaN(Number(value)) && Number(value) >= -180 && Number(value) <= 180,
                { message: "Kinh độ phải từ -180 đến 180." }
            ),
        age: z
            .string()
            .optional()
            .refine(
                (value) => !value || (!Number.isNaN(Number(value)) && Number(value) >= 0 && Number(value) <= 150),
                { message: "Tuổi phải trong khoảng 0-150." }
            ),
        address: z.string().optional(),
        acceptedTerms: z.boolean().refine((value) => value === true, {
            message: "Bạn phải đồng ý với điều khoản.",
        }),
    })

    type ShopRegisterForm = z.infer<typeof shopRegisterSchema>

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<ShopRegisterForm>({
        resolver: zodResolver(shopRegisterSchema),
        defaultValues: {
            email: "",
            password: "",
            fullName: "",
            phone: "",
            shopName: "",
            shopAddressText: "",
            locationSource: "MANUAL",
            lat: "",
            lng: "",
            age: "",
            address: "",
            acceptedTerms: false,
        },
    })

    const locationSourceRegister = register("locationSource")
    const watchLocationSource = watch("locationSource")
    const watchLat = watch("lat")
    const watchLng = watch("lng")

    const [showPassword, setShowPassword] = useState(false)
    const [avatar, setAvatar] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

    const [isMapOpen, setIsMapOpen] = useState(false)
    const [pickerCoords, setPickerCoords] = useState({ lat: 10.77, lng: 106.67 })
    const [isGettingLocation, setIsGettingLocation] = useState(false)
    const [isTermsOpen, setIsTermsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (!avatar) {
            setAvatarPreview(null)
            return
        }

        const url = URL.createObjectURL(avatar)
        setAvatarPreview(url)

        return () => {
            URL.revokeObjectURL(url)
        }
    }, [avatar])

    const onSubmit = async (values: ShopRegisterForm) => {
        setIsSubmitting(true)

        try {
            const formData = new FormData()
            formData.append("email", values.email.trim())
            formData.append("password", values.password)
            formData.append("fullName", values.fullName.trim())
            formData.append("phone", values.phone.trim())
            formData.append("shopName", values.shopName.trim())
            formData.append("shopAddressText", values.shopAddressText.trim())
            if (values.address) formData.append("address", values.address.trim())
            if (values.age) formData.append("age", values.age)
            if (values.lat) formData.append("lat", values.lat)
            if (values.lng) formData.append("lng", values.lng)
            formData.append("locationSource", values.locationSource)
            if (avatar) formData.append("avatarUrlPreview", avatar)

            await registerApi(formData)

            notify.success("Đăng ký thành công. Vui lòng theo dõi email để nhận phản hồi.")
            setTimeout(() => navigate("/login", { replace: true }), 1800)
        } catch (err: any) {
            const message =
                err?.response?.data?.message ??
                err?.response?.data?.error ??
                err?.message ??
                String(err) ??
                "Đăng ký thất bại. Vui lòng thử lại."
            notify.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const inputBase =
        "w-full rounded-lg px-4 py-2.5 text-sm text-white outline-none transition focus:ring-2 focus:ring-blue-500/60"
    const inputStyle: React.CSSProperties = {
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(74, 144, 217, 0.3)",
    }

    const handleUseBrowserGeo = async () => {
        setIsGettingLocation(true)

        try {
            const position = await getBrowserGeoLocation()
            setValue("lat", String(position.lat), { shouldDirty: true })
            setValue("lng", String(position.lng), { shouldDirty: true })
            setValue("locationSource", "BROWSER_GEO", { shouldDirty: true })
            setPickerCoords(position)
            notify.success("Đã lấy vị trí trình duyệt.")
        } catch (error: any) {
            notify.error(error?.message ?? "Không thể lấy vị trí.")
        } finally {
            setIsGettingLocation(false)
        }
    }

    const openMapPicker = () => {
        const currentLat = Number(watchLat) || 10.77
        const currentLng = Number(watchLng) || 106.67
        setPickerCoords({ lat: currentLat, lng: currentLng })
        setValue("locationSource", "PLACE_PICKER", { shouldDirty: true })
        setIsMapOpen(true)
    }

    const confirmMapPicker = () => {
        setValue("lat", String(pickerCoords.lat), { shouldDirty: true })
        setValue("lng", String(pickerCoords.lng), { shouldDirty: true })
        setIsMapOpen(false)
    }

    function MapClickHandler() {
        useMapEvents({
            click(event: LeafletMouseEvent) {
                setPickerCoords({ lat: event.latlng.lat, lng: event.latlng.lng })
            },
        })
        return null
    }

    return (
        <AuthLayout
            title="Đăng ký Shop Owner"
            subtitle="Tạo tài khoản để quản lý cửa hàng của bạn."
            isWideForm
            footer={
                <span className="text-blue-200/60">
                    Đã có tài khoản?{" "}
                    <button
                        type="button"
                        onClick={onLogin}
                        className="font-semibold text-blue-300 hover:text-white transition"
                    >
                        Đăng nhập
                    </button>
                </span>
            }
        >
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                {/* ── Owner Information ─────────────────────────────────── */}
                <div>
                    <div className="mb-2 text-xs font-bold uppercase tracking-wider text-yellow-400/80">
                        <i className="pi pi-user mr-2" />
                        Thông tin chủ
                    </div>
                    <p className="mb-3 text-xs text-blue-200/60">Các trường có dấu <span className="text-red-400">*</span> là bắt buộc.</p>

                    <div className="grid grid-cols-3 gap-3">
                        {/* Email */}
                        <div className="col-span-3">
                            <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-200/70">
                                <i className="pi pi-envelope h-3.5 w-3.5" />
                                Hộp thư <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="email"
                                {...register("email")}
                                className={inputBase}
                                style={inputStyle}
                                autoComplete="email"
                            />
                            {errors.email && (
                                <p className="mt-1 text-xs text-red-300">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="col-span-3">
                            <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-200/70">
                                <i className="pi pi-lock h-3.5 w-3.5" />
                                Mật khẩu <span className="text-red-400">*</span> (6-32 ký tự)
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    {...register("password")}
                                    className={`${inputBase} pr-10`}
                                    style={inputStyle}
                                    autoComplete="new-password"
                                />
                                {errors.password && (
                                    <p className="mt-1 text-xs text-red-300">{errors.password.message}</p>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 inset-y-0 flex items-center text-blue-300/50 hover:text-blue-200 transition"
                                >
                                    {showPassword ? (
                                        <i className="pi pi-eye-slash h-4 w-4" />
                                    ) : (
                                        <i className="pi pi-eye h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Full Name */}
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-200/70">
                                <i className="pi pi-id-card h-3.5 w-3.5" />
                                Tên <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                {...register("fullName")}
                                className={inputBase}
                                style={inputStyle}
                            />
                            {errors.fullName && (
                                <p className="mt-1 text-xs text-red-300">{errors.fullName.message}</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-200/70">
                                <i className="pi pi-phone h-3.5 w-3.5" />
                                SĐT <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="tel"
                                {...register("phone")}
                                className={inputBase}
                                style={inputStyle}
                            />
                            {errors.phone && (
                                <p className="mt-1 text-xs text-red-300">{errors.phone.message}</p>
                            )}
                        </div>

                        {/* Age */}
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-200/70">
                                <i className="pi pi-calendar h-3.5 w-3.5" />
                                Tuổi
                            </label>
                            <input
                                type="number"
                                {...register("age")}
                                className={inputBase}
                                style={inputStyle}
                                min="0"
                                max="150"
                            />
                            {errors.age && (
                                <p className="mt-1 text-xs text-red-300">{errors.age.message}</p>
                            )}
                        </div>

                        {/* Address */}
                        <div className="col-span-3">
                            <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-200/70">
                                <i className="pi pi-map-marker h-3.5 w-3.5" />
                                Địa chỉ cá nhân
                            </label>
                            <input
                                type="text"
                                {...register("address")}
                                className={inputBase}
                                style={inputStyle}
                            />
                            {errors.address && (
                                <p className="mt-1 text-xs text-red-300">{errors.address.message}</p>
                            )}
                        </div>

                        {/* Avatar */}
                        <div className="col-span-3">
                            <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-200/70">
                                <i className="pi pi-image h-3.5 w-3.5" />
                                Avatar
                            </label>
                            <div className="relative mx-auto aspect-square w-full max-w-[200px] overflow-hidden rounded-3xl border border-dashed border-blue-400/30 bg-slate-950/70">
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (!file) {
                                            setAvatar(null)
                                            return
                                        }

                                        if (!file.type.startsWith("image/")) {
                                            notify.error("Vui lòng chọn tệp ảnh hợp lệ.")
                                            setAvatar(null)
                                            return
                                        }

                                        setAvatar(file)
                                    }}
                                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                />
                                {avatarPreview ? (
                                    <img
                                        src={avatarPreview}
                                        alt="Avatar preview"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
                                        <i className="pi pi-cloud-upload text-xl text-blue-300/50" />
                                        <p className="text-xs text-blue-200/60">
                                            Chọn ảnh
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Shop Information ─────────────────────────────────── */}
                <div className="border-t border-white/10 pt-3">
                    <div className="mb-2 text-xs font-bold uppercase tracking-wider text-yellow-400/80">
                        <i className="pi pi-building mr-2" />
                        Thông tin shop
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Shop Name */}
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-200/70">
                                <i className="pi pi-tag h-3.5 w-3.5" />
                                Tên shop <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                {...register("shopName")}
                                className={inputBase}
                                style={inputStyle}
                            />
                            {errors.shopName && (
                                <p className="mt-1 text-xs text-red-300">{errors.shopName.message}</p>
                            )}
                        </div>

                        {/* Shop Address */}
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-200/70">
                                <i className="pi pi-map-marker h-3.5 w-3.5" />
                                Địa chỉ shop <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                {...register("shopAddressText")}
                                className={inputBase}
                                style={inputStyle}
                            />
                            {errors.shopAddressText && (
                                <p className="mt-1 text-xs text-red-300">{errors.shopAddressText.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Location Information ─────────────────────────────────── */}
                <div className="border-t border-white/10 pt-3">
                    <div className="mb-2 text-xs font-bold uppercase tracking-wider text-yellow-400/80">
                        <i className="pi pi-compass mr-2" />
                        Vị trí địa lý
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {/* Location Source */}
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-200/70">
                                <i className="pi pi-cog h-3.5 w-3.5" />
                                Nguồn
                            </label>
                            <select
                                {...locationSourceRegister}
                                onChange={(e) => {
                                    locationSourceRegister.onChange(e)
                                    const nextSource = e.target.value as "MANUAL" | "BROWSER_GEO" | "PLACE_PICKER"

                                    if (nextSource === "BROWSER_GEO") {
                                        handleUseBrowserGeo()
                                    }

                                    if (nextSource === "PLACE_PICKER") {
                                        openMapPicker()
                                    }
                                }}
                                className={`${inputBase} cursor-pointer text-black`}
                                style={{ ...inputStyle, color: "black" }}
                            >
                                <option style={{ color: "black" }} value="MANUAL">Tự nhập</option>
                                <option style={{ color: "black" }} value="BROWSER_GEO">Trình duyệt</option>
                                <option style={{ color: "black" }} value="PLACE_PICKER">Bản đồ</option>
                            </select>

                            {watchLocationSource === "BROWSER_GEO" && isGettingLocation && (
                                <div className="mt-2 text-xs text-blue-200">Đang lấy vị trí trình duyệt...</div>
                            )}

                            {watchLocationSource === "PLACE_PICKER" && !isMapOpen && (
                                <div className="mt-2 text-xs text-blue-200">Bấm vào bản đồ để chọn vị trí.</div>
                            )}
                        </div>

                        {/* Latitude */}
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-200/70">
                                <i className="pi pi-arrows-v h-3.5 w-3.5" />
                                Vĩ độ <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="number"
                                {...register("lat")}
                                step="any"
                                className={inputBase}
                                style={inputStyle}
                                min="-90"
                                max="90"
                            />
                            {errors.lat && (
                                <p className="mt-1 text-xs text-red-300">{errors.lat.message}</p>
                            )}
                        </div>

                        {/* Longitude */}
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-200/70">
                                <i className="pi pi-arrows-h h-3.5 w-3.5" />
                                Kinh độ <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="number"
                                {...register("lng")}
                                step="any"
                                className={inputBase}
                                style={inputStyle}
                                min="-180"
                                max="180"
                            />
                            {errors.lng && (
                                <p className="mt-1 text-xs text-red-300">{errors.lng.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                {isMapOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-4xl overflow-hidden rounded-[32px] border border-slate-700/70 bg-slate-950/95 shadow-[0_32px_80px_rgba(15,23,42,0.65)] ring-1 ring-slate-600/60">
                            <div className="border-b border-slate-700/80 bg-slate-900/90 px-5 py-4 backdrop-blur-sm">
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-300 shadow-inner shadow-blue-500/5">
                                            <i className="pi pi-map-marker text-lg" />
                                        </span>
                                        <div>
                                            <h3 className="text-base font-semibold text-white">Chọn vị trí trên bản đồ</h3>
                                            <p className="text-sm text-slate-400">Bấm vào bản đồ để chọn điểm, sau đó xác nhận.</p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        label="Đóng"
                                        icon="pi pi-times"
                                        onClick={() => setIsMapOpen(false)}
                                        className="!m-0 !inline-flex !h-11 !items-center !justify-center !rounded-2xl !border !border-slate-700/80 !bg-slate-900 !px-4 !py-0 !text-sm !font-semibold !text-slate-200 hover:!bg-slate-800 [&_.p-button-icon]:!text-slate-200 [&_.p-button-label]:!text-slate-200"
                                    />
                                </div>
                            </div>

                            <div className="relative h-[420px] overflow-hidden bg-slate-900">
                                <MapContainer center={[pickerCoords.lat, pickerCoords.lng]} zoom={13} className="h-full w-full">
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <MapClickHandler />
                                    <CircleMarker
                                        center={[pickerCoords.lat, pickerCoords.lng]}
                                        pathOptions={{ color: "#60a5fa", fillColor: "#60a5fa" }}
                                        radius={10}
                                    />
                                </MapContainer>
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                    <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-blue-300/30 bg-blue-500/10 shadow-[0_0_0_8px_rgba(96,165,250,0.08)]">
                                        <span className="h-3.5 w-3.5 rounded-full bg-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.6)]" />
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4 bg-slate-950/90 px-5 py-4 sm:px-6">
                                <div className="rounded-3xl border border-slate-700/80 bg-slate-900/95 p-4 text-sm text-slate-200 shadow-inner shadow-slate-950/20">
                                    <div className="text-xs uppercase tracking-[0.24em] text-blue-300/80">Vị trí đang chọn</div>
                                    <div className="mt-2 font-medium text-white">
                                        {pickerCoords.lat.toFixed(6)}, {pickerCoords.lng.toFixed(6)}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
                                    <Button
                                        type="button"
                                        label="Hủy"
                                        icon="pi pi-times"
                                        onClick={() => setIsMapOpen(false)}
                                        className="!m-0 !inline-flex !h-11 !min-w-[110px] !items-center !justify-center !rounded-2xl !border !border-slate-700/80 !bg-slate-900 !px-4 !py-0 !text-sm !font-semibold !text-slate-200 hover:!bg-slate-800 [&_.p-button-icon]:!text-slate-200 [&_.p-button-label]:!text-slate-200"
                                    />
                                    <Button
                                        type="button"
                                        label="Chọn vị trí này"
                                        icon="pi pi-check"
                                        onClick={confirmMapPicker}
                                        className="!m-0 !inline-flex !h-11 !min-w-[170px] !items-center !justify-center !rounded-2xl !border-none !bg-blue-500 !px-4 !py-0 !text-sm !font-semibold !text-white !shadow-[0_12px_30px_rgba(59,130,246,0.24)] hover:!bg-blue-400 [&_.p-button-icon]:!text-white [&_.p-button-label]:!text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Agree terms */}
                <div className="border-t border-white/10 pt-3">
                    <div className="flex items-start gap-3">
                        <label className="flex items-start gap-2 text-sm text-blue-100">
                            <input
                                type="checkbox"
                                {...register("acceptedTerms")}
                                className="mt-1 h-4 w-4 rounded border-blue-300 bg-slate-950 text-blue-500 focus:ring-blue-400"
                            />
                            <span className="text-xs leading-5 text-blue-200">
                                Tôi đồng ý với{' '}
                                <button
                                    type="button"
                                    onClick={() => setIsTermsOpen(true)}
                                    className="text-blue-300 font-semibold hover:text-blue-200 transition"
                                >
                                    điều khoản
                                </button>
                                .
                            </span>
                        </label>
                    </div>
                    {errors.acceptedTerms && (
                        <p className="mt-2 text-xs text-red-300">{errors.acceptedTerms.message}</p>
                    )}
                </div>

                {/* Submit */}
                <div className="border-t border-white/10 pt-3">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-lg py-2 text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                        style={{
                            background: isSubmitting
                                ? "rgba(74,144,217,0.5)"
                                : "linear-gradient(90deg, #3b6fd4 0%, #4a90d9 100%)",
                            boxShadow: "0 4px 16px rgba(74,144,217,0.3)",
                        }}
                    >
                        {isSubmitting ? "Đang đăng ký..." : "Đăng ký Shop"}
                    </button>
                </div>
            </form>

            <Dialog
                visible={isTermsOpen}
                onHide={() => setIsTermsOpen(false)}
                header="Điều khoản sử dụng"
                style={{ width: '100%', maxWidth: '48rem' }}
                contentClassName="bg-[#0A1A44] text-slate-200 border-none"
                headerClassName="bg-[#0A1A44] text-white border-b border-slate-800"
            >
                <div className="mb-4 text-sm text-slate-400 mt-2">Vui lòng đọc kỹ điều khoản trước khi đăng ký.</div>
                <div className="space-y-4 text-sm leading-6 text-slate-200">
                    <p>
                        Đây là điều khoản mẫu cho việc đăng ký Shop Owner. Bạn đồng ý cung cấp thông tin chính xác và tuân thủ chính sách sử dụng dịch vụ.
                    </p>
                    <p>
                        1. Người dùng chịu trách nhiệm về thông tin đã khai báo.
                    </p>
                    <p>
                        2. Shell không chịu trách nhiệm về các nội dung hoặc giao dịch ngoài phạm vi ứng dụng.
                    </p>
                    <p>
                        3. Việc vi phạm quy định có thể dẫn đến khóa tài khoản hoặc chấm dứt dịch vụ.
                    </p>
                    <p>
                        4. Bạn cam kết không sử dụng dịch vụ vào mục đích trái pháp luật.
                    </p>
                </div>
                <div className="flex justify-center pt-4 mt-4 border-t border-slate-800">
                    <Button
                        type="button"
                        label="Đóng"
                        icon="pi pi-times"
                        onClick={() => setIsTermsOpen(false)}
                        className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-xl !border-none !bg-blue-500 !px-4 !py-0 !text-sm !font-semibold !text-white hover:!bg-blue-400 [&_.p-button-icon]:!text-white [&_.p-button-label]:!text-white"
                    />
                </div>
            </Dialog>
        </AuthLayout>
    )
}
