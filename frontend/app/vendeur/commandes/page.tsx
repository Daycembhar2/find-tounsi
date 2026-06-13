"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { authService } from "@/services/auth.service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function VendeurCommandesPage() {
  
  const [user, setUser] = useState<any>(null)
const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
  const currentUser = authService.getCurrentUser()

  if (!currentUser?.id) return

  setUser(currentUser)

  api
    .get(`/api/orders/seller/${currentUser.id}`)
    .then((res) => {
      setOrders(res.data.data || [])
    })
    .catch(console.error)
}, [])

  const updateStatus = async (id: string, status: string) => {
    await api.put(`/api/orders/${id}/status`, { status })
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Commandes vendeur</h1>

      {orders.length === 0 ? (
        <p>Aucune commande pour le moment.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <CardTitle>Commande #{order.order_number}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <p>Client : {order.user?.name || "Client"}</p>
                <p>Ville : {order.delivery_city}</p>
                <p>Total : {Number(order.total_amount).toFixed(3)} TND</p>
                <p>Statut : {order.status}</p>

                <div>
                  {order.order_items?.map((item: any) => (
                    <p key={item.id}>
                      {item.product?.name} × {item.quantity}
                    </p>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => updateStatus(order.id, "confirmed")}>
                    Confirmer
                  </Button>
                  <Button onClick={() => updateStatus(order.id, "shipped")}>
                    Expédier
                  </Button>
                  <Button onClick={() => updateStatus(order.id, "delivered")}>
                    Livrer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}