export function HomeFooter() {
  return (
    <footer className="py-12 bg-muted/30 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="text-3xl">PS</div>
              <span className="text-2xl font-bold text-primary">PetSpaHub</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              The leading platform connecting pet spas and pet lovers in Vietnam
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">For Customers</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>Find a Spa</li>
              <li>Book</li>
              <li>Reviews</li>
              <li>Offers</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">For Spas</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>List Your Spa</li>
              <li>Manage</li>
              <li>Pricing</li>
              <li>Support</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>Email: info@petspahub.vn</li>
              <li>Hotline: 1900-xxxx</li>
              <li>Facebook</li>
              <li>Instagram</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border text-center text-muted-foreground">
          <p>&copy; 2026 PetSpaHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
