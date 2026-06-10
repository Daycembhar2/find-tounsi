"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2, CreditCard } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Order } from "@/lib/types"

export default function PaymentPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [cardNumber, setCardNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [cardName, setCardName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          router.push("/auth/login")
          return
        }

        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .eq("payment_status", "unpaid")
          .order("created_at", { ascending: false })

        if (ordersError) throw ordersError

        setOrders(ordersData || [])
        if (ordersData && ordersData.length > 0) {
          setSelectedOrder(ordersData[0])
        }
      } catch (error) {
        console.error("[v0] Error loading orders:", error)
        setError("Erreur lors du chargement des commandes")
      } finally {
        setIsLoading(false)
      }
    }

    loadOrders()
  }, [])

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrder) return

    setIsProcessing(true)
    setError(null)

    try {
      // Validate card details (basic validation)
      if (cardNumber.length < 13 || cardNumber.length > 19) {
        throw new Error("Numéro de carte invalide")
      }

      if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
        throw new Error("Date d'expiration invalide (format MM/YY)")
      }

      if (cvv.length < 3 || cvv.length > 4) {
        throw new Error("CVV invalide")
      }

      // In production, this would integrate with Stripe or another payment processor
      // For now, we'll simulate a payment
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Session expirée")

      // Extract card info (last 4 digits)
      const cardLastFour = cardNumber.slice(-4)
      const cardBrand = cardNumber.startsWith("4") ? "Visa" : cardNumber.startsWith("5") ? "Mastercard" : "Unknown"

      // Update payment record
      const { error: paymentError } = await supabase
        .from("payments")
        .update({
          status: "completed",
          transaction_id: `TXN${Date.now()}`,
          card_last_four: cardLastFour,
          card_brand: cardBrand,
        })
        .eq("order_id", selectedOrder.id)

      if (paymentError) throw paymentError

      // Update order status
      const { error: orderError } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          status: "confirmed",
        })
        .eq("id", selectedOrder.id)

      if (orderError) throw orderError

      setSuccess(true)
      setTimeout(() => {
        router.push(`/commande/suivi/${selectedOrder.id}`)
        router.refresh()
      }, 2000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erreur lors du paiement")
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Chargement des commandes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">Paiement Sécurisé</h1>
          </div>
          <p className="text-muted-foreground">Complétez votre paiement</p>
        </div>

        {orders.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">Tous les paiements sont à jour!</p>
              <p className="text-muted-foreground mb-4">Vous n'avez pas de commandes en attente de paiement.</p>
              <Button onClick={() => router.push("/produits")}>Retour aux produits</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Orders List */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Commandes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {orders.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`w-full p-3 rounded-lg text-left transition ${
                        selectedOrder?.id === order.id
                          ? "bg-primary/10 border-2 border-primary"
                          : "bg-muted/50 border-2 border-transparent hover:bg-muted"
                      }`}
                    >
                      <p className="font-semibold text-sm">{order.order_number}</p>
                      <p className="text-xs text-muted-foreground">{order.total_amount.toFixed(3)} TND</p>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Payment Form */}
            {selectedOrder && (
              <div className="md:col-span-2 space-y-6">
                {/* Order Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Récapitulatif</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Commande</span>
                      <span className="font-semibold">{selectedOrder.order_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Montant</span>
                      <span className="font-semibold">{selectedOrder.total_amount.toFixed(3)} TND</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Livraison</span>
                      <span className="font-semibold">{selectedOrder.delivery_address}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informations de paiement</CardTitle>
                    <CardDescription>Entrez vos coordonnées bancaires sécurisées</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePayment} className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="cardName">Titulaire de la carte</Label>
                        <Input
                          id="cardName"
                          placeholder="Nom sur la carte"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="cardNumber">Numéro de carte</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber
                            .replace(/\s/g, "")
                            .replace(/(\d{4})/g, "$1 ")
                            .trim()}
                          onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ""))}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="expiry">Date d'expiration</Label>
                          <Input
                            id="expiry"
                            placeholder="MM/YY"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            type="password"
                            placeholder="123"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                            maxLength={4}
                            required
                          />
                        </div>
                      </div>

                      {error && (
                        <div className="flex gap-2 text-sm text-destructive p-3 bg-destructive/10 rounded-lg">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          {error}
                        </div>
                      )}

                      {success && (
                        <div className="flex gap-2 text-sm text-green-600 p-3 bg-green-50 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          Paiement réussi! Redirection...
                        </div>
                      )}

                      <Button type="submit" className="w-full" disabled={isProcessing}>
                        {isProcessing ? "Traitement..." : `Payer ${selectedOrder.total_amount.toFixed(3)} TND`}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
