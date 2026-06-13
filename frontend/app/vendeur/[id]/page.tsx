import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function PublicSellerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  const res = await fetch(`${API_URL}/api/products`, {
    cache: "no-store",
  })

  const json = await res.json()
  const allProducts = json.data || []

  const sellerProducts = allProducts.filter(
    (product: any) => product.seller_id === id
  )

  const sellerName = sellerProducts[0]?.seller?.name || "Vendeur FindTounsi"

  return (
    <div className="container py-12">
      <div className="mb-8 rounded-lg border p-6">
        <h1 className="text-3xl font-bold">{sellerName}</h1>
        <p className="text-muted-foreground mt-2">
          Vendeur de produits tunisiens authentiques.
        </p>
      </div>

      <h2 className="text-2xl font-bold mb-6">Produits du vendeur</h2>

      {sellerProducts.length === 0 ? (
        <p>Aucun produit trouvé pour ce vendeur.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sellerProducts.map((product: any) => (
            <div key={product.id} className="border rounded-lg p-4">
              <img
                src={product.image_url || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-48 object-cover rounded-md mb-4"
              />

              <h3 className="font-semibold">{product.name}</h3>

              <p className="text-sm text-muted-foreground">
                {product.category?.name || "Sans catégorie"}
              </p>

              <p className="font-bold text-primary mt-2">
                {Number(product.price || 0).toFixed(3)} {product.currency || "DT"}
              </p>

              <Button asChild className="w-full mt-4">
                <Link href={`/produits/${product.id}`}>Voir le produit</Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}