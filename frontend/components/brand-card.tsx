import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Brand } from "@/lib/types"

interface BrandCardProps {
  brand: Brand
}

export function BrandCard({ brand }: BrandCardProps) {
  return (
    <Link href={`/marques/${brand.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 flex-shrink-0 rounded-lg bg-muted overflow-hidden">
              <Image
                src={brand.logo_url || "/placeholder.svg?height=100&width=100"}
                alt={brand.name}
                fill
                className="object-contain p-2"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground truncate">{brand.name}</h3>
                {brand.is_verified && (
                  <Badge variant="secondary" className="text-xs">
                    Vérifié
                  </Badge>
                )}
              </div>
              {brand.name_ar && <p className="text-sm text-muted-foreground mt-1">{brand.name_ar}</p>}
              {brand.founded && (<p className="text-xs text-muted-foreground mt-1">Depuis {brand.founded}</p>)}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
