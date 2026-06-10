import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { ProductCard } from "@/components/product-card"
import { Heart } from "lucide-react"
import type { Product } from "@/lib/types"

export default async function FavorisPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: favorites } = await supabase
    .from("favorites")
    .select("*, products(*, brands(*), categories(*))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-20 md:pb-8">
        <div className="container px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Mes Favoris</h1>
            <p className="text-muted-foreground">{favorites?.length || 0} produit(s) favori(s)</p>
          </div>

          {favorites && favorites.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {favorites.map((fav: any) => (
                <ProductCard key={fav.id} product={fav.products as Product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Aucun favori pour le moment</h2>
              <p className="text-muted-foreground">Ajoutez des produits à vos favoris pour les retrouver facilement</p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
