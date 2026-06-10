"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle2, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DeliveryPage() {
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!address || !city || !phone) {
      setError("Veuillez remplir tous les champs obligatoires")
      setIsLoading(false)
      return
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Vous devez être connecté")

      // Get cart from session
      const cartData = sessionStorage.getItem("checkout_cart")
      if (!cartData) throw new Error("Panier vide")

      const cartItems = JSON.parse(cartData)

      // Group by seller and create orders
      const ordersBySeller: Record<string, any> = {}
      for (const item of cartItems) {
        if (!ordersBySeller[item.seller_id]) {
          ordersBySeller[item.seller_id] = {
            items: [],
            total: 0,
          }
        }
        ordersBySeller[item.seller_id].items.push(item)
        ordersBySeller[item.seller_id].total += item.unit_price * item.quantity
      }

      // Create order for each seller
      for (const [sellerId, orderData] of Object.entries(ordersBySeller)) {
        const orderNumber = `TN${Date.now()}`
        const shippingCost = 5
        const tax = orderData.total * 0.07
        const totalAmount = orderData.total + shippingCost + tax

        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert({
            user_id: user.id,
            seller_id: sellerId,
            order_number: orderNumber,
            total_amount: totalAmount,
            shipping_cost: shippingCost,
            tax_amount: tax,
            status: "pending",
            payment_status: "unpaid",
            delivery_address: address,
            delivery_city: city,
            notes: notes || null,
          })
          .select()
          .single()

        if (orderError) throw orderError

        // Add order items
        const itemsToInsert = orderData.items.map((item: any) => ({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.unit_price * item.quantity,
        }))

        const { error: itemsError } = await supabase.from("order_items").insert(itemsToInsert)

        if (itemsError) throw itemsError

        // Create payment record
        const { error: paymentError } = await supabase.from("payments").insert({
          order_id: order.id,
          user_id: user.id,
          amount: totalAmount,
          currency: "TND",
          payment_method: "card",
          status: "pending",
        })

        if (paymentError) throw paymentError
      }

      setSuccess(true)
      sessionStorage.removeItem("checkout_cart")
      localStorage.removeItem("findtounsi_cart")

      setTimeout(() => {
        router.push("/commande/paiement")
        router.refresh()
      }, 1500)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erreur lors de la création de la commande")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">Adresse de Livraison</h1>
          </div>
          <p className="text-muted-foreground">Entrez vos coordonnées exactes pour la livraison</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 grid gap-2">
                  <Label htmlFor="address">Adresse complète *</Label>
                  <Textarea
                    id="address"
                    placeholder="Rue, numéro, immeuble..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="city">Ville *</Label>
                  <Input
                    id="city"
                    placeholder="Ex: Tunis"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="postal">Code postal</Label>
                  <Input
                    id="postal"
                    placeholder="Ex: 1000"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                </div>

                <div className="md:col-span-2 grid gap-2">
                  <Label htmlFor="phone">Téléphone de contact *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+216 XX XXX XXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="md:col-span-2 grid gap-2">
                  <Label htmlFor="notes">Notes de livraison</Label>
                  <Textarea
                    id="notes"
                    placeholder="Instructions spéciales pour la livraison..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="flex gap-2 text-sm text-destructive p-4 bg-destructive/10 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              {success && (
                <div className="flex gap-2 text-sm text-green-600 p-4 bg-green-50 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  Commande créée avec succès! Redirection vers le paiement...
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Création..." : "Continuer vers le paiement"}
                </Button>
                <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={() => router.back()}>
                  Retour
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
