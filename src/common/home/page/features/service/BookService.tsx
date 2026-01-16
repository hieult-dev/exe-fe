interface BookServiceProps {
  onBack?: () => void
}

export function BookService({ onBack }: BookServiceProps) {
  return (
    <section className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">Đặt lịch dịch vụ</h2>
  
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="rounded-full px-5 py-2 border border-border text-sm hover:bg-muted/60 transition"
            >
              Quay lai
            </button>
          )}
        </div>

      </div>
    </section>
  )
}
