import { useCallback, useEffect, useState } from "react"
import { Button } from "primereact/button"
import { Toolbar } from "primereact/toolbar"
import {
  getShopGhtkConfig,
  updateShopGhtkConfig,
} from "@/apps/ghtk_config/api/ghtkConfigApi"
import { GhtkConfigForm } from "@/apps/ghtk_config/components/GhtkConfigForm"
import type { GhtkConfigApiError, GhtkConfigDTO, GhtkConfigRequest } from "@/apps/ghtk_config/model"
import { useUserStore } from "@/apps/user/store/UserStore"
import { resolveCurrentAuthShop } from "@/common/auth/utils/shopAccess"
import { notify } from "@/common/toast/ToastHelper"

const formId = "shop-ghtk-config-form"

function getErrorMessage(error: unknown, fallback: string) {
  const apiError = error as Partial<GhtkConfigApiError> | undefined
  return apiError?.message || fallback
}

export function ShopGhtkConfigPage() {
  const currentShopId = useUserStore((state) => state.currentShopId)
  const shops = useUserStore((state) => state.shops)
  const currentShop = resolveCurrentAuthShop(shops, currentShopId)
  const [config, setConfig] = useState<GhtkConfigDTO | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const canUseApi = typeof currentShopId === "number"

  const loadConfig = useCallback(async () => {
    if (!canUseApi) {
      setConfig(null)
      return
    }

    setIsLoading(true)

    try {
      const result = await getShopGhtkConfig(currentShopId)
      setConfig(result)
    } catch (error) {
      notify.error(getErrorMessage(error, "Không thể tải cấu hình GHTK."))
    } finally {
      setIsLoading(false)
    }
  }, [canUseApi, currentShopId])

  useEffect(() => {
    void loadConfig()
  }, [loadConfig])

  const handleSubmitConfig = async (request: GhtkConfigRequest) => {
    if (!canUseApi) {
      notify.error("Không xác định được cửa hàng hiện tại.")
      return
    }

    setIsSaving(true)

    try {
      const savedConfig = await updateShopGhtkConfig(currentShopId, request)
      setConfig(savedConfig)
      notify.success("Đã lưu cấu hình GHTK.")
    } catch (error) {
      notify.error(getErrorMessage(error, "Không thể lưu cấu hình GHTK."))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-2">
      <Toolbar
        className="rounded-xl border-none bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]"
        start={
          <div>
            <h1 className="text-lg font-semibold text-slate-800">Cấu hình GHTK</h1>
            <p className="mt-0.5 text-sm text-slate-500">{currentShop?.name ?? "Cửa hàng hiện tại"}</p>
          </div>
        }
        end={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="submit"
              form={formId}
              label="Lưu cấu hình"
              icon="pi pi-save"
              loading={isSaving}
              disabled={!canUseApi || isLoading}
              className="!h-9 !rounded-md !border-[#214388] !bg-[#214388] !px-4 !py-0 !text-sm !font-semibold !text-white hover:!bg-[#19356a] [&_.p-button-icon]:!text-white [&_.p-button-label]:!text-white"
            />
          </div>
        }
      />

      <div className="flex-1 rounded-xl bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.05)] lg:p-4">
        <GhtkConfigForm formId={formId} config={config} onSubmit={handleSubmitConfig} />
      </div>
    </div>
  )
}
