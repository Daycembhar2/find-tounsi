import { createClient } from "@/lib/supabase/server"
import Header from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { CategoryCard } from "@/components/CategoryCard"
import type { Category } from "@/lib/types"

export default async function CategoriesPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
  const res = await fetch(`${API_URL}/categories`, { cache: "no-store" })
  const categories: Category[] = await res.json()

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Toutes les Catégories</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  )
}