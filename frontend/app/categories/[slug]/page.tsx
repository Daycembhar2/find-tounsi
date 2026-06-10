// app/categories/[slug]/page.tsx
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { CategoryTracker } from "@/components/CategoryTracker" // 🆕 AJOUTEZ
import { RecommendedCategories } from "@/components/RecommendedCategories" // 🆕 AJOUTEZ

export default async function CategoryProductsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

  console.log("🔍 Slug reçu:", slug)

  try {
    const res = await fetch(`${API_URL}/products/by-category/${slug}`, { 
      cache: "no-store" 
    })
    
    console.log("🔍 Statut HTTP:", res.status)

    if (!res.ok) {
      console.error("❌ Erreur API:", res.status)
      notFound()
    }

    const products = await res.json()
    console.log("✅ Produits reçus:", products.length)

    // 🚨 Aucun produit trouvé
    if (!products || products.length === 0) {
      return (
        <div className="container py-12">
          <h1 className="text-3xl font-bold mb-6">Catégorie : {slug}</h1>
          <p className="text-muted-foreground">Aucun produit trouvé dans cette catégorie.</p>
          <Link href="/categories">
            <Button className="mt-4">Retour aux catégories</Button>
          </Link>
        </div>
      )
    }

    // ✅ Affichage des produits
    return (
      <div className="container py-12">
        {/* 🆕 AJOUTEZ CES DEUX COMPOSANTS */}
        <CategoryTracker categorySlug={slug} />
        <RecommendedCategories currentCategory={slug} />
        
        <h1 className="text-3xl font-bold mb-6">Produits : {slug}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product: any) => (
            <Link
              key={product.id}
              href={`/produits/${product.id}`}
              className="group block rounded-lg border bg-background shadow hover:shadow-lg transition overflow-hidden"
            >
              <div className="aspect-square w-full overflow-hidden">
                <Image
                  src={product.image_url || "https://via.placeholder.com/400x400"}
                  alt={product.name}
                  width={400}
                  height={400}
                  className="object-cover w-full h-full group-hover:scale-105 transition"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {product.price} {product.currency}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    )

  } catch (error) {
    console.error("💥 Erreur fetch:", error)
    notFound()
  }
}