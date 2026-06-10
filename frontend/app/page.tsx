import Header from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { CategoryCard } from "@/components/CategoryCard"
import { ProductCard } from "@/components/product-card"
import { BrandCard } from "@/components/brand-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Category, Product, Brand } from "@/lib/types"

export default async function Home() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

  // ✅ Fetch categories
  const categoriesRes = await fetch(`${API_URL}/categories?limit=4`, { cache: "no-store" })
  const categories: Category[] = categoriesRes.ok ? await categoriesRes.json() : []

  // ✅ Fetch products
  const productsRes = await fetch(`${API_URL}/products?limit=4`, { cache: "no-store" })
  const products: Product[] = productsRes.ok ? await productsRes.json() : []

  // ✅ Fetch brands
  const brandsRes = await fetch(`${API_URL}/brands?limit=6`, { cache: "no-store" })
  const brands: Brand[] = brandsRes.ok ? await brandsRes.json() : []

  return (
    <div className="min-h-screen flex flex-col">
      

      <main className="flex-1 pb-20 md:pb-8">
        {/* Hero Section */}
        <section
          className="relative bg-cover bg-center bg-no-repeat h-[600px] border-b"
          style={{ backgroundImage: "url('/assets/hero-tunisia.jpg')" }}
        >
          <div className="absolute inset-0 bg-black/10 dark:bg-black/10"></div>
          <div className="relative z-10 container h-full flex flex-col items-center justify-center text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Découvrez les Produits 100% Tunisiens
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              Soutenez l'économie locale en trouvant facilement les marques et produits tunisiens près de chez vous
            </p>
          </div>
        </section>

        {/* Categories Section */}
        <section id="categories" className="py-12 md:py-16">
          <div className="container px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Catégories</h2>
              <Button variant="ghost" asChild>
                <Link href="/categories">Voir tout</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.length === 0 ? (
                <p className="text-muted-foreground">Aucune catégorie trouvée.</p>
              ) : (
                categories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))
              )}
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Produits Populaires</h2>
              <Button variant="ghost" asChild>
                <Link href="/produits">Voir tout</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.length === 0 ? (
                <p className="text-muted-foreground">Aucun produit trouvé.</p>
              ) : (
                products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              )}
            </div>
          </div>
        </section>

        {/* Brands Section */}
        <section className="py-12 md:py-16">
          <div className="container px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Marques Tunisiennes</h2>
              <Button variant="ghost" asChild>
                <Link href="/marques">Voir tout</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {brands.length === 0 ? (
                <p className="text-muted-foreground">Aucune marque trouvée.</p>
              ) : (
                brands.map((brand) => (
                  <BrandCard key={brand.id} brand={brand} />
                ))
              )}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16 bg-muted/30">
          <div className="container px-4 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-6">Qui sommes-nous ?</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Bienvenue sur <span className="font-semibold text-primary">www.FindTounsi.com</span>, 
              le premier site tunisien spécialisé dans la vente de produits tunisiens en ligne.
              Nous sommes fiers d'être à la pointe de cet innovant concept, permettant à tous
              les amoureux de la Tunisie de découvrir et d'acheter facilement les meilleurs
              produits tunisiens depuis leur domicile. <br /><br />
              Et bonne nouvelle : nous assurons la livraison à domicile, même en Europe 🇪🇺.
            </p>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}
