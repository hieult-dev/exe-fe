const petMoments = [
  { src: "/fluffy-dog-grooming.jpg", alt: "Fluffy dog grooming" },
  { src: "/pet-grooming-station.jpg", alt: "Grooming station" },
  { src: "/cute-happy-dog-getting-spa-treatment-grooming.jpg", alt: "Happy dog spa treatment" },
  { src: "/cute-cat-after-grooming-spa.jpg", alt: "Cat after grooming" },
  { src: "/luxury-pet-hotel-lobby.jpg", alt: "Pet hotel lobby" },
  { src: "/modern-pet-grooming-salon.png", alt: "Modern pet grooming salon" },
]

export function PetMomentsSection() {
  return (
    <section className="rounded-sm bg-white p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold uppercase tracking-wide text-slate-700">Khoanh khac pet</h3>
        <p className="text-xs text-slate-500">Khong gian tu cong dong chu pet</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {petMoments.map((item) => (
          <article key={item.src} className="group overflow-hidden rounded-sm border border-[#f1f1f1]">
            <div className="h-48 overflow-hidden">
              <img
                src={item.src}
                alt={item.alt}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="border-t border-[#f5f5f5] px-3 py-2 text-sm text-slate-600">{item.alt}</div>
          </article>
        ))}
      </div>
    </section>
  )
}
