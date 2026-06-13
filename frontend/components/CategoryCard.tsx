import Link from "next/link"
import type { Category } from "@/lib/types"

export function CategoryCard({ category }: { category: Category }) {
  return (
     <Link href={`/categories/${category.slug}`} className="group block rounded-lg border bg-background shadow hover:shadow-lg transition overflow-hidden">
      <div className="aspect-square w-full overflow-hidden">
        <img src={category.icon || "/placeholder.svg"} alt={category.name} className="h-full w-full object-cover" />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{category.name}</h3>
      </div>
    </Link>
  )
}

