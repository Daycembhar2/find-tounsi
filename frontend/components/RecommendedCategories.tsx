"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

interface RecommendedCategoriesProps {
  currentCategory?: string
  title?: string
}

const categoryLabels: Record<string, string> = {
  'cosmetiques'       : 'Cosmétiques',
  'vetements'         : 'Vêtements',
  'artisanat'         : 'Artisanat',
  'alimentation'      : 'Alimentation',
  'electronique'      : 'Électronique',
  'bijoux-tunisiennes': 'Bijoux Tunisiens',
}

export function RecommendedCategories({
  currentCategory,
  title = "Recommandé pour vous",
}: RecommendedCategoriesProps) {
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    const viewed = JSON.parse(localStorage.getItem('viewed_categories') || '[]')
    const filtered = viewed.filter((c: string) => c !== currentCategory).slice(0, 4)
    setCategories(filtered)
  }, [currentCategory])

  if (categories.length === 0) return null

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-yellow-500" />
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Link key={category} href={`/categories/${category}`}>
            <Button variant="outline" size="sm" className="text-sm">
              {categoryLabels[category] || category}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  )
}