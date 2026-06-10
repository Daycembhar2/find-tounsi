import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
  showFavorite?: boolean
}

export function ProductCard({ product, showFavorite = true }: ProductCardProps) {
  return (
    <Card className="group overflow-hidden bg-card hover:bg-secondary/50 border-secondary transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 card-hover">
      <CardHeader className="p-0">
        <Link href={`/produits/${product.id}`}>
          <div className="relative aspect-square overflow-hidden bg-muted">
            <Image
              src={product.image_url || "/placeholder.svg?height=300&width=300&query=product tunisien"}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {product.is_100_percent_tunisian && (
              <Badge className="absolute top-3 left-3 badge-tunisien animate-fadeInUp">100% Tounsi</Badge>
            )}
            {showFavorite && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 h-8 w-8 bg-background/80 hover:bg-primary hover:text-white transition-all duration-300"
              >
                <Heart className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-4">
        <Link href={`/produits/${product.id}`}>
          <h3 className="font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
          {product.brands && <p className="text-sm text-accent mt-1">{product.brands.name}</p>}
        </Link>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        {product.price && <p className="text-lg font-bold text-primary">{product.price.toFixed(3)} TND</p>}
        <Button size="sm" className="btn-primary">
          <ShoppingCart className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
