"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { ProductCard } from "@/components/product-card"
import { Heart } from "lucide-react"
import { authService } from "@/services/auth.service"
import { favoritesService } from "@/services/favorites.service"
import type { Product } from "@/lib/types"

export default function FavorisPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const user = authService.getCurrentUser()
    if (!user) {
      router.push("/auth/login?next=/favoris")
      return
    }

    const loadFavorites = async () => {
      try {
        const result = await favoritesService.getAll()
        const items = (result.data || []).map((fav: { product: Product }) => fav.product).filter(Boolean)
        setProducts(items)
      } catch {
        const saved = localStorage.getItem("findtounsi_favorites")
        const ids: string[] = saved ? JSON.parse(saved) : []
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        const fetched = await Promise.all(
          ids.map(async (id) => {
            const res = await fetch(`${API_URL}/api/products/${id}`)
            if (!res.ok) return null
            const json = await res.json()
            return json.data as Product
          })
        )
        setProducts(fetched.filter(Boolean) as Product[])
      } finally {
        setIsLoading(false)
      }
    }

    loadFavorites()
  }, [router])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-20 md:pb-8">
        <div className="container px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Mes Favoris</h1>
            <p className="text-muted-foreground">{products.length} produit(s) favori(s)</p>
          </div>

          {isLoading ? (
            <p className="text-muted-foreground">Chargement...</p>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
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
