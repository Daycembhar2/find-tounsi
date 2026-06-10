import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { ProductCard } from "@/components/product-card"
import { FilterSidebar } from "@/components/filter-sidebar"
import type { Product } from "@/lib/types"

export default async function ProduitsPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
  const res = await fetch(`${API_URL}/products`, { cache: "no-store" })
  const products: Product[] = await res.json()

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Tous les Produits Populaires</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}