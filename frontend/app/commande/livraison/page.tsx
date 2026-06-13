"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { authService } from "@/services/auth.service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function DeliveryPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<any[]>([])
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const user = authService.getCurrentUser()

    if (!user) {
      router.push("/auth/login?next=/commande/livraison")
      return
    }

    const saved = sessionStorage.getItem("checkout_cart") || localStorage.getItem("findtounsi_cart")
    const cart = saved ? JSON.parse(saved) : []

    if (cart.length === 0) {
      router.push("/cart")
      return
    }

    setCartItems(cart)
  }, [router])

  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.unit_price) * Number(item.quantity),
    0
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const user = authService.getCurrentUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    if (!address.trim() || !city.trim()) {
      setError("Adresse et ville sont obligatoires")
      return
    }

    try {
      setIsSaving(true)

      const groupedBySeller = cartItems.reduce((acc: any, item: any) => {
        if (!acc[item.seller_id]) acc[item.seller_id] = []
        acc[item.seller_id].push(item)
        return acc
      }, {})

      for (const [sellerId, items] of Object.entries(groupedBySeller)) {
        await api.post("/api/orders", {
          user_id: user.id,
          seller_id: sellerId,
          delivery_address: address,
          delivery_city: city,
          items: (items as any[]).map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
          })),
        })
      }

      localStorage.removeItem("findtounsi_cart")
      sessionStorage.removeItem("checkout_cart")
      window.dispatchEvent(new Event("cartUpdated"))

      router.push("/commande/sucess")
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors de la création de la commande")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-background">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Adresse de livraison</h1>

        <Card>
          <CardHeader>
            <CardTitle>Finaliser la commande</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-2">
                <Label>Adresse</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Votre adresse complète"
                />
              </div>

              <div className="grid gap-2">
                <Label>Ville</Label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: Nabeul"
                />
              </div>

              <div className="rounded-lg border p-4 bg-muted/30">
                <p className="font-semibold mb-2">Résumé</p>
                <p className="text-sm text-muted-foreground">
                  {cartItems.length} article(s)
                </p>
                <p className="text-xl font-bold text-primary mt-2">
                  {total.toFixed(3)} TND
                </p>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? "Création de la commande..." : "Confirmer la commande"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}