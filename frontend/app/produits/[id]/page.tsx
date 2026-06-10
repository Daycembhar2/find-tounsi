// app/produits/[id]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Heart, Star, Shield, Truck, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface Product {
  id: string
  name: string
  price: number
  currency: string
  description: string
  image_url: string
  brand: string
  category_slug: string
  slug: string
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState<string | null>(null)

  const productId = params.id as string

  useEffect(() => {
    fetchProduct()
  }, [productId])

  const fetchProduct = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
      const response = await fetch(`${API_URL}/products/${productId}`)
      
      if (response.ok) {
        const productData = await response.json()
        setProduct(productData)
      } else {
        console.error("Produit non trouvé")
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const addToCart = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push(`/auth/login?next=/produits/${productId}`)
      return
    }

    if (!product) return

    const cartItem = {
      product_id: product.id,
      product_name: product.name,
      quantity: quantity,
      unit_price: product.price,
      seller_id: product.brand || "vendeur-1",
      seller_name: product.brand || "Vendeur FindTounsi",
      image_url: product.image_url
    }

    // Récupérer le panier actuel
    const savedCart = localStorage.getItem("findtounsi_cart")
    const currentCart = savedCart ? JSON.parse(savedCart) : []

    // Vérifier si le produit est déjà dans le panier
    const existingItemIndex = currentCart.findIndex((item: any) => item.product_id === product.id)

    if (existingItemIndex >= 0) {
      // Mettre à jour la quantité
      currentCart[existingItemIndex].quantity += quantity
    } else {
      // Ajouter le nouveau produit
      currentCart.push(cartItem)
    }

    // Sauvegarder dans localStorage
    localStorage.setItem("findtounsi_cart", JSON.stringify(currentCart))
    
    // Émettre l'événement pour mettre à jour le header
    window.dispatchEvent(new Event('cartUpdated'))

    setMessage(`✅ ${quantity} ${product.name} ajouté(s) au panier !`)
    setTimeout(() => setMessage(null), 3000)
  }

  const handleBuyNow = () => {
    addToCart()
    setTimeout(() => {
      router.push("/cart")
    }, 1000)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement du produit...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Produit non trouvé</h1>
          <Button onClick={() => router.push("/categories")}>
            Retour aux catégories
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Navigation */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          
          <nav className="text-sm text-muted-foreground">
            <Link href="/categories" className="hover:text-primary transition-colors">
              Catégories
            </Link>
            <span className="mx-2">/</span>
            <Link 
              href={`/categories/${product.category_slug}`}
              className="hover:text-primary transition-colors"
            >
              {product.category_slug}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image du produit */}
          <div className="space-y-4">
            <div className="aspect-square w-full overflow-hidden rounded-lg border bg-gray-50">
              <img
                src={product.image_url || "/placeholder-product.jpg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Informations du produit */}
          <div className="space-y-6">
            <div>
              {product.brand && (
                <p className="text-sm text-muted-foreground mb-2">{product.brand}</p>
              )}
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(24 avis)</span>
              </div>

              <p className="text-3xl font-bold text-primary mb-6">
                {product.price.toFixed(3)} {product.currency}
              </p>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Quantité */}
            <div className="space-y-3">
              <h3 className="font-semibold">Quantité</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  Total: {(product.price * quantity).toFixed(3)} {product.currency}
                </span>
              </div>
            </div>

            {/* Message de confirmation */}
            {message && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700">
                {message}
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex gap-4">
              <Button 
                onClick={addToCart}
                className="flex-1"
                size="lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Ajouter au panier
              </Button>
              
              <Button 
                onClick={handleBuyNow}
                variant="default"
                className="flex-1 bg-green-600 hover:bg-green-700"
                size="lg"
              >
                Commander maintenant
              </Button>
              
              <Button variant="outline" size="icon">
                <Heart className="w-5 h-5" />
              </Button>
            </div>

            {/* Garanties */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Paiement 100% sécurisé</span>
                </div>
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Livraison en 2-4 jours</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 text-green-600">↩️</span>
                  <span className="text-sm">Retour facile sous 30 jours</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}