import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { ProductCard } from "@/components/product-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Globe, Calendar } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Product } from "@/lib/types"

export default async function BrandDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  // Fetch brand
  const { data: brand } = await supabase.from("brands").select("*").eq("id", params.id).single()

  if (!brand) {
    notFound()
  }

  // Fetch brand products
  const { data: products } = await supabase
    .from("products")
    .select("*, brands(*), categories(*)")
    .eq("brand_id", params.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-20 md:pb-8">
        {/* Brand Header */}
        <div className="bg-muted/30 border-b">
          <div className="container px-4 py-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Brand Logo */}
              <div className="relative h-24 w-24 flex-shrink-0 rounded-lg bg-background border overflow-hidden">
                <Image
                  src={brand.logo_url || "/placeholder.svg?height=200&width=200"}
                  alt={brand.name}
                  fill
                  className="object-contain p-4"
                />
              </div>

              {/* Brand Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">{brand.name}</h1>
                  {brand.is_verified && <Badge className="bg-primary">Vérifié</Badge>}
                </div>

                {brand.name_ar && <p className="text-lg text-muted-foreground mb-4">{brand.name_ar}</p>}

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {brand.founded_year && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Depuis {brand.founded_year}</span>
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

            {/* Description */}
            {brand.description && (
              <div className="mt-6">
                <p className="text-muted-foreground leading-relaxed max-w-3xl">{brand.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Products */}
        <div className="container px-4 py-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Produits de {brand.name} ({products?.length || 0})
          </h2>

          {products && products.length > 0 ? (
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
