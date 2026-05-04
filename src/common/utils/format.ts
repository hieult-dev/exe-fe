export function formatCurrencyVND(value: number | null | undefined) {
  return `${Number(value ?? 0).toLocaleString("vi-VN")}đ`
}

export function formatDateTimeViVN(value: string | null | undefined, fallback = "—") {
  if (!value) return fallback

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatDateOnlyViVN(value: Date | string | null | undefined, fallback = "—") {
  if (!value) return fallback

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return fallback

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function formatDateForApi(value: Date | null | undefined) {
  if (!value || Number.isNaN(value.getTime())) return undefined

  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function formatFileSize(bytes: number | null | undefined) {
  const value = Number(bytes ?? 0)
  if (!Number.isFinite(value) || value <= 0) return "0 KB"
  if (value < 1024) return `${value} B`

  const units = ["KB", "MB", "GB"]
  let size = value / 1024
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }

  return `${size >= 10 ? size.toFixed(0) : size.toFixed(1)} ${units[unitIndex]}`
}

export function toUppercaseNoDiacritics(value: string) {
  return value
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
}

const VIETNAMESE_DIGITS = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"]
const VND_SCALES = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"]

export function toDigitsOnly(value: string) {
  return value.replace(/\D/g, "").replace(/^0+(?=\d)/, "")
}

export function formatVndInput(value: string) {
  const digits = toDigitsOnly(value)
  if (!digits) return ""
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

function readThreeDigits(value: number, forceFullRead: boolean) {
  const hundred = Math.floor(value / 100)
  const ten = Math.floor((value % 100) / 10)
  const one = value % 10
  const words: string[] = []

  if (hundred > 0 || forceFullRead) {
    words.push(VIETNAMESE_DIGITS[hundred], "trăm")
  }

  if (ten > 1) {
    words.push(VIETNAMESE_DIGITS[ten], "mươi")
    if (one === 1) words.push("mốt")
    else if (one === 5) words.push("lăm")
    else if (one > 0) words.push(VIETNAMESE_DIGITS[one])
  } else if (ten === 1) {
    words.push("mười")
    if (one === 5) words.push("lăm")
    else if (one > 0) words.push(VIETNAMESE_DIGITS[one])
  } else if (one > 0) {
    if (hundred > 0 || forceFullRead) words.push("linh")
    words.push(VIETNAMESE_DIGITS[one])
  }

  return words.join(" ")
}

export function readVndAmount(value: string) {
  const digits = toDigitsOnly(value)
  if (!digits) return "Chưa nhập giá bán"
  if (digits === "0") return "Không đồng"

  const chunks: number[] = []
  for (let end = digits.length; end > 0; end -= 3) {
    chunks.unshift(Number(digits.slice(Math.max(0, end - 3), end)))
  }

  const words: string[] = []
  chunks.forEach((chunk, index) => {
    if (chunk === 0) return

    const scaleIndex = chunks.length - index - 1
    const hasHigherValue = words.length > 0
    const chunkWords = readThreeDigits(chunk, hasHigherValue && chunk < 100)
    words.push(chunkWords)

    const scale = VND_SCALES[scaleIndex]
    if (scale) words.push(scale)
  })

  const sentence = `${words.join(" ")} đồng`
  return sentence.charAt(0).toUpperCase() + sentence.slice(1)
}
