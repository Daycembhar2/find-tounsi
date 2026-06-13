"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Package } from "lucide-react"
import { authService } from "@/services/auth.service"
import { ordersService } from "@/services/orders.service"
import type { Order } from "@/lib/types"

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const user = authService.getCurrentUser()
    if (!user) {
      router.push("/auth/login")
      return
    }

    ordersService
      .getById(params.id as string)
      .then(setOrder)
      .catch(() => router.push("/mes-commandes"))
      .finally(() => setIsLoading(false))
  }, [params.id, router])

  if (isLoading) {
    return <div className="container py-8">Chargement...</div>
  }

  if (!order) {
    return <div className="container py-8">Commande introuvable</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/mes-commandes">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux commandes
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{order.order_number || `Commande #${order.id}`}</CardTitle>
            <Badge>{order.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>Adresse : {order.delivery_address}</p>
            <p>Ville : {order.delivery_city}</p>
            <p>Total : {Number(order.total_amount).toFixed(3)} TND</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Articles
            </h3>
            <div className="space-y-2">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm border rounded-lg p-3">
                  <span>{item.product?.name || "Produit"} × {item.quantity}</span>
                  <span>{Number(item.total_price).toFixed(3)} TND</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
