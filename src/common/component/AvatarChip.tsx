interface AvatarChipProps {
  name: string
  avatarUrl?: string | null
  size?: number
}

export function AvatarChip({
  name,
  avatarUrl,
  size = 32,
}: AvatarChipProps) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover border border-white/80"
      />
    )
  }

  const initial = (name?.trim()?.[0] ?? "U").toUpperCase()
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-white text-[#1e90ff] flex items-center justify-center font-bold border border-white/80"
    >
      {initial}
    </div>
  )
}
