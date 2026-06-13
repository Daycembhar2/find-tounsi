"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authService } from "@/services/auth.service"
import type { CartItem } from "@/lib/types"

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const savedCart = localStorage.getItem("findtounsi_cart")
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }
    setIsLoading(false)
  }, [])

  const updateCart = (items: CartItem[]) => {
    setCartItems(items)
    localStorage.setItem("findtounsi_cart", JSON.stringify(items))
    // Émettre un événement pour mettre à jour le compteur du header
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const removeItem = (productId: string) => {
    updateCart(cartItems.filter((item) => item.product_id !== productId))
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId)
    } else {
      updateCart(
        cartItems.map((item) =>
          item.product_id === productId ? { ...item, quantity: newQuantity } : item
        )
      )
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
  const shippingCost = subtotal > 50 ? 0 : 5.0 // Livraison gratuite au-dessus de 50 TND
  const tax = subtotal * 0.07
  const total = subtotal + shippingCost + tax

  const groupedBySeller = cartItems.reduce(
    (acc, item) => {
      const sellerKey = item.seller_id
      if (!acc[sellerKey]) {
        acc[sellerKey] = { seller_name: item.seller_name, items: [] }
      }
      acc[sellerKey].items.push(item)
      return acc
    },
    {} as Record<string, { seller_name: string; items: CartItem[] }>
  )

  const handleCheckout = () => {
    const user = authService.getCurrentUser()
    if (!user) {
      router.push("/auth/login?next=/cart")
      return
    }

    sessionStorage.setItem("checkout_cart", JSON.stringify(cartItems))
    router.push("/commande/livraison")
  }

  const clearCart = () => {
    if (confirm("Êtes-vous sûr de vouloir vider votre panier ?")) {
      updateCart([])
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement de votre panier...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2 flex items-center gap-2">
            <ShoppingCart className="w-8 h-8" />
            Mon Panier
          </h1>
          <p className="text-muted-foreground">{cartItems.length} article(s)</p>
        </div>

        {cartItems.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Votre panier est vide</p>
              <Link href="/categories">
                <Button>Découvrir nos produits</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Liste des articles */}
            <div className="lg:col-span-2 space-y-4">
              {Object.entries(groupedBySeller).map(([sellerId, sellerGroup]) => (
                <Card key={sellerId}>
                  <CardHeader>
                    <CardTitle className="text-lg">{sellerGroup.seller_name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {sellerGroup.items.map((item) => (
                      <div
                        key={item.product_id}
                        className="flex gap-4 pb-4 border-b last:pb-0 last:border-0"
                      >
                        {/* Image du produit */}
                        <div className="flex-shrink-0">
                          <img 
                            src={item.image_url || "/placeholder-product.jpg"} 
                            alt={item.product_name}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.product_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {item.unit_price.toFixed(3)} TND par unité
                          </p>
                        </div>
                        
                        {/* Contrôles de quantité */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {/* Prix et suppression */}
                        <div className="text-right min-w-24">
                          <p className="font-semibold">
                            {(item.unit_price * item.quantity).toFixed(3)} TND
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.product_id)}
                            className="text-destructive hover:text-destructive/90"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
              
              {/* Bouton vider le panier */}
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={clearCart}
                  className="text-destructive border-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Vider le panier
                </Button>
              </div>
            </div>

            {/* Résumé de commande */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Résumé de la commande</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span>{subtotal.toFixed(3)} TND</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Livraison</span>
                      <span className={shippingCost === 0 ? "text-green-600" : ""}>
                        {shippingCost === 0 ? "Gratuite" : `${shippingCost.toFixed(3)} TND`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxes (7%)</span>
                      <span>{tax.toFixed(3)} TND</span>
                    </div>
                    
                    {subtotal < 50 && (
                      <div className="text-xs text-green-600 bg-green-50 p-2 rounded-md dark:bg-green-950">
                        💡 Ajoutez {(50 - subtotal).toFixed(3)} TND pour la livraison gratuite !
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{total.toFixed(3)} TND</span>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg" 
                    onClick={handleCheckout}
                    disabled={cartItems.length === 0}
                  >
                    Procéder au paiement
                  </Button>

                  <Link href="/categories">
                    <Button variant="outline" className="w-full">
                      Continuer vos achats
                    </Button>
                  </Link>

                  <div className="text-xs text-muted-foreground text-center">
                    <p>✅ Paiement sécurisé</p>
                    <p>🚚 Livraison en 2-4 jours</p>
                    <p>↩️ Retours faciles sous 30 jours</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}