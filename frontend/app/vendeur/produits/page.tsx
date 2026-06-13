import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, Plus, Eye, Pencil, AlertTriangle, XCircle, CheckCircle2 } from "lucide-react"
import { DeleteProductButton } from "@/components/delete-product-button"
export default async function VendeurProduitsPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
  const sellerId = "fea19d27-0d28-463c-bd5a-51884ee58686"

  const res = await fetch(`${API_URL}/api/products?seller_id=${sellerId}`, {
    cache: "no-store",
  })

  const json = await res.json()
  const products = json.data || []

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Mes Produits</h1>
          <p className="text-muted-foreground">
            Gérez vos produits, stocks et disponibilités.
          </p>
        </div>

        <Button asChild>
          <Link href="/vendeur/produits/ajouter">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 border rounded-xl">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Aucun produit.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product: any) => {
            const stock = product.stock
            const isOutOfStock = stock === 0
            const isLowStock = stock !== null && stock !== undefined && stock > 0 && stock <= 5
            const isAvailable = product.is_available !== false && !isOutOfStock

            return (
              <div
                key={product.id}
                className="border rounded-xl p-4 flex items-center gap-4 bg-background"
              >
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-20 h-20 rounded-lg object-cover bg-muted"
                />

                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold truncate">{product.name}</h2>

                  <p className="text-sm text-muted-foreground">
                    {product.category?.name || "Sans catégorie"}
                    {product.region?.name ? ` · ${product.region.name}` : ""}
                  </p>

                  <p className="font-bold text-primary mt-1">
                    {Number(product.price || 0).toFixed(3)} {product.currency || "DT"}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {product.is_100_percent_tunisian && (
                      <Badge variant="outline">🇹🇳 100% Tunisien</Badge>
                    )}

                    {isAvailable ? (
                      <Badge className="bg-green-100 text-green-700 border border-green-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Disponible
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 border border-red-200">
                        <XCircle className="w-3 h-3 mr-1" />
                        Rupture / indisponible
                      </Badge>
                    )}

                    {isLowStock && (
                      <Badge className="bg-yellow-100 text-yellow-700 border border-yellow-200">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Stock faible
                      </Badge>
                    )}

                    <Badge variant="secondary">
                      Stock : {stock ?? "non défini"}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2">

  <Button variant="outline" asChild>
    <Link href={`/produits/${product.id}`}>
      <Eye className="w-4 h-4" />
    </Link>
  </Button>

  <Button asChild>
    <Link href={`/vendeur/produits/${product.id}/modifier`}>
      <Pencil className="w-4 h-4" />
    </Link>
  </Button>

  <DeleteProductButton productId={product.id} />

</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}