import { ProductCard } from "@/components/product-card"
import type { Product } from "@/lib/types"

export default async function ProduitsPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  const res = await fetch(`${API_URL}/api/products`, { cache: "no-store" })

  if (!res.ok) {
    return (
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-4">Tous les Produits Populaires</h1>
        <p className="text-red-500">Erreur de chargement des produits.</p>
      </div>
    )
  }

  const json = await res.json()
  const products: Product[] = Array.isArray(json) ? json : json.data || []

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Tous les Produits Populaires</h1>

      {products.length === 0 ? (
        <p className="text-muted-foreground">Aucun produit trouvé.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}