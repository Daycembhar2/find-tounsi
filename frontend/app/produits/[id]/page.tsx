"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ShoppingCart,
  Heart,
  Star,
  Shield,
  Truck,
  ArrowLeft,
  MapPin,
  Building2,
  Tag,
  Barcode,
  CheckCircle2,
  Share2,
} from "lucide-react"
import { authService } from "@/services/auth.service"
import { favoritesService } from "@/services/favorites.service"
import Link from "next/link"
import type { Product } from "@/lib/types"

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [activeImage, setActiveImage] = useState<string | null>(null)

  const productId = params.id as string

  useEffect(() => {
    if (productId) fetchProduct()
  }, [productId])

  useEffect(() => {
    if (product) {
      setActiveImage(product.image_url || "/placeholder.svg")
      checkFavorite()
    }
  }, [product])

  const fetchProduct = async () => {
    try {
      setIsLoading(true)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const response = await fetch(`${API_URL}/api/products/${productId}`)

      if (!response.ok) {
        setProduct(null)
        return
      }

      const json = await response.json()
      const data = json.data || json
      setProduct(data)
    } catch (error) {
      console.error("Erreur fetchProduct:", error)
      setProduct(null)
    } finally {
      setIsLoading(false)
    }
  }

  const checkFavorite = async () => {
    if (!product || !authService.isAuthenticated()) return
    try {
      const result = await favoritesService.check(product.id)
      setIsFavorite(result.isFavorite)
    } catch {
      const saved = localStorage.getItem("findtounsi_favorites")
      if (!saved) return
      const favs: string[] = JSON.parse(saved)
      setIsFavorite(favs.includes(product.id))
    }
  }

  const toggleFavorite = async () => {
    const user = authService.getCurrentUser()

    if (!user) {
      router.push(`/auth/login?next=/produits/${productId}`)
      return
    }

    if (!product) return

    try {
      if (isFavorite) {
        await favoritesService.remove(product.id)
        setMessage({ text: "Retiré des favoris", type: "success" })
      } else {
        await favoritesService.add(product.id)
        setMessage({ text: "❤️ Ajouté aux favoris !", type: "success" })
      }
      setIsFavorite(!isFavorite)
    } catch {
      const saved = localStorage.getItem("findtounsi_favorites")
      const favs: string[] = saved ? JSON.parse(saved) : []
      const newFavs = isFavorite
        ? favs.filter((id) => id !== product.id)
        : [...favs, product.id]
      localStorage.setItem("findtounsi_favorites", JSON.stringify(newFavs))
      setIsFavorite(!isFavorite)
    }

    setTimeout(() => setMessage(null), 2500)
  }

  const addToCart = () => {
    const user = authService.getCurrentUser()

    if (!user) {
      router.push(`/auth/login?next=/produits/${productId}`)
      return
    }

    if (!product) return

    const sellerId = product.seller_id || product.seller?.id
    if (!sellerId) {
      setMessage({ text: "Ce produit n'a pas de vendeur associé", type: "error" })
      return
    }

    const cartItem = {
      product_id: product.id,
      product_name: product.name,
      quantity,
      unit_price: Number(product.price || 0),
      seller_id: sellerId,
      seller_name: product.seller?.business_name || product.seller?.name || "Vendeur FindTounsi",
      image_url: product.image_url,
      currency: product.currency || "TND",
    }

    const savedCart = localStorage.getItem("findtounsi_cart")
    const currentCart = savedCart ? JSON.parse(savedCart) : []
    const existingIndex = currentCart.findIndex((item: any) => item.product_id === product.id)

    if (existingIndex >= 0) {
      currentCart[existingIndex].quantity += quantity
    } else {
      currentCart.push(cartItem)
    }

    localStorage.setItem("findtounsi_cart", JSON.stringify(currentCart))
    window.dispatchEvent(new Event("cartUpdated"))

    setMessage({ text: `✅ ${quantity}× ${product.name} ajouté au panier !`, type: "success" })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleBuyNow = () => {
    addToCart()
    setTimeout(() => router.push("/cart"), 800)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product?.name, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      setMessage({ text: "🔗 Lien copié !", type: "success" })
      setTimeout(() => setMessage(null), 2000)
    }
  }

  // ─── Loading ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Chargement du produit...</p>
        </div>
      </div>
    )
  }

  // ─── Not found ────────────────────────────────────────────
  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-5xl">🔍</p>
          <h1 className="text-2xl font-bold">Produit introuvable</h1>
          <p className="text-muted-foreground">Ce produit n'existe pas ou a été supprimé.</p>
          <Button onClick={() => router.push("/categories")}>
            Parcourir les catégories
          </Button>
        </div>
      </div>
    )
  }

  // ─── Helpers ──────────────────────────────────────────────
  const brandName =
    typeof product.brand === "object" && product.brand !== null
      ? product.brand.name
      : product.brand || null

  const categoryName = product.category?.name || product.category_slug || null
  const categorySlug = product.category?.slug || product.category_slug || ""
  const regionName = product.region?.name || null
  const price = Number(product.price || 0)
  const currency = product.currency || "TND"
  const images = product.images?.length
    ? product.images
    : product.image_url
    ? [product.image_url]
    : ["/placeholder.svg"]

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* ─── Breadcrumb ─── */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-3 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Retour
          </Button>
          <nav className="text-sm text-muted-foreground flex flex-wrap items-center gap-1">
            <Link href="/categories" className="hover:text-primary transition-colors">Catégories</Link>
            {categorySlug && (
              <>
                <span>/</span>
                <Link href={`/categories/${categorySlug}`} className="hover:text-primary transition-colors">
                  {categoryName}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ─── Images ─── */}
          <div className="space-y-3">
            <div className="aspect-square w-full overflow-hidden rounded-xl border bg-gray-50 relative">
              {product.is_100_percent_tunisian && (
                <div className="absolute top-3 left-3 z-10">
                  <Badge className="bg-red-600 text-white gap-1">
                    🇹🇳 100% Tunisien
                  </Badge>
                </div>
              )}
              {product.is_verified && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge className="bg-green-600 text-white gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Vérifié
                  </Badge>
                </div>
              )}
              <img
                src={activeImage || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }}
              />
            </div>

            {/* Thumbnails si plusieurs images */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${
                      activeImage === img ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Infos produit ─── */}
          <div className="space-y-5">

            {/* Marque + titre */}
            <div>
              {brandName && (
                <p className="text-sm text-muted-foreground mb-1 font-medium">{brandName}</p>
              )}
              <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-3">
                {product.name}
              </h1>

              {/* Étoiles */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(product.average_rating || 4)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.average_rating?.toFixed(1) || "4.0"} ({product.review_count || 24} avis)
                </span>
              </div>

              {/* Prix */}
              <p className="text-3xl font-bold text-primary">
                {price.toFixed(3)} <span className="text-lg font-normal">{currency}</span>
              </p>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Description
                </h2>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {product.description}
                </p>
              </div>
            )}

            {/* Métadonnées */}
            <div className="grid grid-cols-2 gap-3 text-sm bg-muted/40 rounded-xl p-4 border">
              {brandName && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Entreprise</p>
                    <p className="font-medium">{brandName}</p>
                  </div>
                </div>
              )}
              {categoryName && (
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Catégorie</p>
                    <p className="font-medium">{categoryName}</p>
                  </div>
                </div>
              )}
              {regionName && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Région</p>
                    <p className="font-medium">{regionName}</p>
                  </div>
                </div>
              )}
              {product.barcode && (
                <div className="flex items-center gap-2">
                  <Barcode className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Code-barres</p>
                    <p className="font-medium font-mono text-xs">{product.barcode}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quantité */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Quantité
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-none"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    −
                  </Button>
                  <span className="w-10 text-center font-semibold text-base select-none">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-none"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  Total :{" "}
                  <span className="font-semibold text-foreground">
                    {(price * quantity).toFixed(3)} {currency}
                  </span>
                </span>
              </div>
            </div>

            {/* Message feedback */}
            {message && (
              <div
                className={`p-3 rounded-lg text-sm font-medium ${
                  message.type === "success"
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex gap-3">
              <Button onClick={addToCart} className="flex-1" size="lg">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Ajouter
              </Button>
              <Button
                onClick={handleBuyNow}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                Commander
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={`h-11 w-11 ${isFavorite ? "text-red-500 border-red-300" : ""}`}
                onClick={toggleFavorite}
                title="Ajouter aux favoris"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500" : ""}`} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11"
                onClick={handleShare}
                title="Partager"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Garanties */}
            <Card className="border-dashed">
              <CardContent className="p-4 grid grid-cols-1 gap-2">
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Paiement 100% sécurisé</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Livraison en 2–4 jours ouvrables</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="w-4 h-4 flex-shrink-0 text-center">↩️</span>
                  <span>Retour facile sous 30 jours</span>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  )
}