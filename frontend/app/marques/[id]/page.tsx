import Header from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { ProductCard } from "@/components/product-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Globe, Calendar } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Brand, Product } from "@/lib/types"

async function getBrand(id: string): Promise<Brand | null> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
  const res = await fetch(`${API_URL}/api/brands/${id}`, { cache: "no-store" })
  if (!res.ok) return null
  const json = await res.json()
  return json.data || null
}

async function getBrandProducts(brandSlug: string): Promise<Product[]> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
  const res = await fetch(`${API_URL}/api/products?brand=${brandSlug}`, { cache: "no-store" })
  if (!res.ok) return []
  const json = await res.json()
  return json.data || []
}

export default async function BrandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const brand = await getBrand(id)

  if (!brand) {
    notFound()
  }

  const products = await getBrandProducts(brand.slug)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-20 md:pb-8">
        <div className="bg-muted/30 border-b">
          <div className="container px-4 py-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative h-24 w-24 flex-shrink-0 rounded-lg bg-background border overflow-hidden">
                <Image
                  src={brand.logo_url || "/placeholder.svg?height=200&width=200"}
                  alt={brand.name}
                  fill
                  className="object-contain p-4"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">{brand.name}</h1>
                  {brand.is_verified && <Badge className="bg-primary">Vérifié</Badge>}
                </div>

                {brand.name_ar && <p className="text-lg text-muted-foreground mb-4">{brand.name_ar}</p>}

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {brand.founded && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Depuis {brand.founded}</span>
                    </div>
                  )}
                  {brand.website && (
                    <Button variant="link" className="h-auto p-0" asChild>
                      <Link href={brand.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4 mr-1" />
                        Site web
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {brand.description && (
              <div className="mt-6">
                <p className="text-muted-foreground leading-relaxed max-w-3xl">{brand.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="container px-4 py-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Produits de {brand.name} ({products.length})
          </h2>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucun produit disponible pour cette marque.</p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
