"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Calendar, Euro, Truck } from "lucide-react"
import { authService } from "@/services/auth.service"
import { ordersService } from "@/services/orders.service"
import type { Order } from "@/lib/types"

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending: { label: "En attente", variant: "secondary" },
  confirmed: { label: "Confirmée", variant: "default" },
  paid: { label: "Payée", variant: "default" },
  shipped: { label: "Expédiée", variant: "outline" },
  delivered: { label: "Livrée", variant: "default" },
  cancelled: { label: "Annulée", variant: "destructive" },
}

export default function MesCommandesPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const user = authService.getCurrentUser()
    if (!user) {
      router.push("/auth/login?next=/mes-commandes")
      return
    }

    ordersService
      .getMyOrders()
      .then(setOrders)
      .catch(() => router.push("/auth/login"))
      .finally(() => setIsLoading(false))
  }, [router])

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Chargement...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Package className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Mes commandes</h1>
      </div>

      {orders.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Aucune commande</h2>
            <p className="text-muted-foreground mb-6">
              Vous n&apos;avez encore passé aucune commande.
            </p>
            <Button asChild>
              <Link href="/produits">Découvrir nos produits</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = statusConfig[order.status] || statusConfig.pending

            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg">
                    Commande {order.order_number || `#${order.id}`}
                  </CardTitle>
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(order.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Euro className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {Number(order.total_amount).toFixed(3)} TND
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {order.status === "delivered" ? "Livrée" : "Non livrée"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/mes-commandes/${order.id}`}>Voir le détail</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
