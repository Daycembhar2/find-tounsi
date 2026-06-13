import { BottomNav } from "@/components/bottom-nav"
import { CategoryCard } from "@/components/CategoryCard"
import type { Category } from "@/lib/types"

export default async function CategoriesPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  try {
    const res = await fetch(`${API_URL}/api/categories`, { cache: "no-store" })
    const json = await res.json()
    const categories: Category[] = json.data || []

    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 pb-20 md:pb-8">
          <div className="container px-4 py-12">
            <h1 className="text-3xl font-bold mb-8">Toutes les Catégories</h1>
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
        </main>
        <BottomNav />
      </div>
    )
  } catch {
    return <div className="container py-12">Erreur de chargement.</div>
  }
}