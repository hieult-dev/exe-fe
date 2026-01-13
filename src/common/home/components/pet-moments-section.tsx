const petMoments = [
    { src: "/fluffy-dog-grooming.jpg", alt: "Fluffy dog grooming" },
    { src: "/pet-grooming-station.jpg", alt: "Grooming station" },
    { src: "/cute-happy-dog-getting-spa-treatment-grooming.jpg", alt: "Happy dog spa treatment" },
    { src: "/cute-cat-after-grooming-spa.jpg", alt: "Cat after grooming" },
    { src: "/luxury-pet-hotel-lobby.jpg", alt: "Pet hotel lobby" },
    { src: "/modern-pet-grooming-salon.png", alt: "Modern pet grooming salon" },
]

export function PetMomentsSection() {
    const items = [...petMoments, ...petMoments]

    return (
        <section className="py-14 bg-muted/20">
            <div className="w-full px-4">

                <div className="relative overflow-hidden">
                    <div className="flex w-max gap-4 motion-safe:animate-pet-marquee">
                        {items.map((item, index) => (
                            <div
                                key={`${item.src}-${index}`}
                                className="h-52 w-80 md:h-60 md:w-96 shrink-0 overflow-hidden rounded-2xl border border-border shadow-lg"
                            >
                                <img src={item.src} alt={item.alt} className="h-full w-full object-cover" />
                            </div>
                        ))}
                    </div>
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-background to-transparent" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent" />
                </div>
            </div>
        </section>
    )
}
