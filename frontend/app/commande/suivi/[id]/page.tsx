"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Package, Truck, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { Order, OrderItem, DeliveryTracking } from "@/lib/types"

export default function OrderTrackingPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [tracking, setTracking] = useState<DeliveryTracking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadOrderData = async () => {
      try {
        // Get order
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", params.id)
          .single()

        if (orderError) throw orderError
        setOrder(orderData)

        // Get order items
        const { data: itemsData, error: itemsError } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", params.id)

        if (itemsError) throw itemsError
        setItems(itemsData || [])

        // Get tracking info
        const { data: trackingData, error: trackingError } = await supabase
          .from("delivery_tracking")
          .select("*")
          .eq("order_id", params.id)
          .single()

        if (!trackingError && trackingData) {
          setTracking(trackingData)
        }
      } catch (error) {
        console.error("[v0] Error loading order:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadOrderData()
  }, [params.id])

  const getTimelineSteps = (status: string) => {
    const steps = [
      { key: "pending", label: "Commande reçue", icon: Package },
      { key: "confirmed", label: "Confirmée", icon: CheckCircle2 },
      { key: "shipped", label: "En transit", icon: Truck },
      { key: "delivered", label: "Livrée", icon: CheckCircle2 },
    ]

    const statusOrder = ["pending", "confirmed", "shipped", "delivered"]
    const currentIndex = statusOrder.indexOf(status)

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Chargement de votre commande...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="text-center max-w-md">
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-4">Commande introuvable</p>
            <Link href="/profil/commandes">
              <Button>Voir mes commandes</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const timelineSteps = getTimelineSteps(order.status)
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Suivi de votre commande</h1>
          <p className="text-muted-foreground">Commande #{order.order_number}</p>
        </div>

        {/* Timeline */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Statut de livraison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              {timelineSteps.map((step, index) => (
                <div key={step.key} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      step.completed ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-center font-medium">{step.label}</p>
                  {index < timelineSteps.length - 1 && (
                    <div className={`h-1 w-full mt-2 ${step.completed ? "bg-primary" : "bg-muted"}`}></div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Delivery Address & Location */}
        {tracking && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Localisation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <p className="text-muted-foreground">Position actuelle</p>
                <p className="font-semibold">{tracking.current_city || "En préparation"}</p>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground">Adresse de livraison</p>
                <p className="font-semibold">{order.delivery_address}</p>
                <p className="text-xs text-muted-foreground">{order.delivery_city}</p>
              </div>
              {tracking.estimated_delivery_time && (
                <>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground">Livraison estimée</p>
                    <p className="font-semibold">
                      {new Date(tracking.estimated_delivery_time).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Détails de la commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Numéro</p>
                <p className="font-semibold">{order.order_number}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-semibold">{new Date(order.created_at).toLocaleDateString("fr-FR")}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Statut</p>
                <Badge className={statusColors[order.status]} variant="secondary">
                  {order.status}
                </Badge>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Paiement</p>
                <Badge
                  className={
                    order.payment_status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {order.payment_status === "paid" ? "Payé" : "En attente"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Articles ({items.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm pb-3 border-b last:pb-0 last:border-0">
                  <div>
                    <p className="font-semibold">{item.product?.name || "Produit"}</p>
                    <p className="text-xs text-muted-foreground">Quantité: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">{item.total_price.toFixed(3)} TND</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <Card className="mt-6">
          <CardContent className="pt-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sous-total</span>
              <span>{(order.total_amount - order.shipping_cost - order.tax_amount).toFixed(3)} TND</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Livraison</span>
              <span>{order.shipping_cost.toFixed(3)} TND</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taxes</span>
              <span>{order.tax_amount.toFixed(3)} TND</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">{order.total_amount.toFixed(3)} TND</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
