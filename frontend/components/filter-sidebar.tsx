"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import type { Category, Brand } from "@/lib/types"

interface FilterSidebarProps {
  categories: Category[]
  brands: Brand[]
  currentCategory?: string
  currentBrand?: string
}

export function FilterSidebar({ categories, brands, currentCategory, currentBrand }: FilterSidebarProps) {
  const searchParams = useSearchParams()
  const hasFilters = currentCategory || currentBrand

  const buildUrl = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    return `/produits?${params.toString()}`
  }

  return (
    <div className="space-y-4">
      {/* Clear Filters */}
      {hasFilters && (
        <Button variant="outline" className="w-full bg-transparent" asChild>
          <Link href="/produits">
            <X className="h-4 w-4 mr-2" />
            Effacer les filtres
          </Link>
        </Button>
      )}

      {/* Categories Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Catégories</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={currentCategory || ""}>
            <div className="space-y-3">
              <Link href="/produits" className="flex items-center space-x-2">
                <RadioGroupItem value="" id="cat-all" />
                <Label htmlFor="cat-all" className="cursor-pointer font-normal">
                  Toutes
                </Label>
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={buildUrl("categorie", category.slug)}
                  className="flex items-center space-x-2"
                >
                  <RadioGroupItem value={category.slug} id={`cat-${category.id}`} />
                  <Label htmlFor={`cat-${category.id}`} className="cursor-pointer font-normal">
                    {category.icon} {category.name}
                  </Label>
                </Link>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Brands Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Marques</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={currentBrand || ""}>
            <div className="space-y-3">
              <Link href="/produits" className="flex items-center space-x-2">
                <RadioGroupItem value="" id="brand-all" />
                <Label htmlFor="brand-all" className="cursor-pointer font-normal">
                  Toutes
                </Label>
              </Link>
              {brands.slice(0, 10).map((brand) => (
                <Link key={brand.id} href={buildUrl("marque", brand.id)} className="flex items-center space-x-2">
                  <RadioGroupItem value={brand.id} id={`brand-${brand.id}`} />
                  <Label htmlFor={`brand-${brand.id}`} className="cursor-pointer font-normal">
                    {brand.name}
                  </Label>
                </Link>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  )
}
