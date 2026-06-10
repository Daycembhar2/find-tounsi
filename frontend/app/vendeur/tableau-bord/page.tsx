"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Plus, Package, ShoppingCart, TrendingUp } from "lucide-react"
import Link from "next/link"
import type { Seller, Order } from "@/lib/types"

export default function SellerDashboard() {
  const [seller, setSeller] = useState<Seller | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        // Get seller info
        const { data: sellerData } = await supabase.from("sellers").select("*").eq("id", user.id).single()

        setSeller(sellerData)

        // Get seller's products
        const { data: productsData } = await supabase.from("products").select("*").eq("seller_id", user.id)

        setProducts(productsData || [])

        // Get seller's orders
        const { data: ordersData } = await supabase
          .from("orders")
          .select("*")
          .eq("seller_id", user.id)
          .order("created_at", { ascending: false })

        setOrders(ordersData || [])
      } catch (error) {
        console.error("[v0] Error loading seller data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const totalRevenue = orders.filter((o) => o.payment_status === "paid").reduce((sum, o) => sum + o.total_amount, 0)

  const totalOrders = orders.length
  const completedOrders = orders.filter((o) => o.status === "delivered").length

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Tableau de Bord Vendeur</h1>
          <p className="text-muted-foreground">Gérez vos produits et commandes</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Produits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{products.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Produits actifs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Commandes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">{completedOrders} livrées</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Revenus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalRevenue.toFixed(3)} TND</div>
              <p className="text-xs text-muted-foreground mt-1">Revenu total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Évaluation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{seller?.average_rating.toFixed(1)}/5</div>
              <p className="text-xs text-muted-foreground mt-1">Note moyenne</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="products" className="flex gap-2">
              <Package className="w-4 h-4" />
              Mes Produits
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex gap-2">
              <ShoppingCart className="w-4 h-4" />
              Commandes
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex gap-2">
              <TrendingUp className="w-4 h-4" />
              Paramètres
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Mes Produits</CardTitle>
                  <CardDescription>Gérez votre catalogue de produits</CardDescription>
                </div>
                <Link href="/vendeur/ajouter-produit">
                  <Button className="flex gap-2">
                    <Plus className="w-4 h-4" />
                    Ajouter Produit
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-4">Aucun produit ajouté</p>
                    <Link href="/vendeur/ajouter-produit">
                      <Button>Ajouter mon premier produit</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">{product.description}</p>
                          <p className="text-sm font-medium text-primary mt-1">{product.price} TND</p>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/vendeur/produit/${product.id}/editer`}>
                            <Button variant="outline" size="sm">
                              Éditer
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm">
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Mes Commandes</CardTitle>
                <CardDescription>Suivi des commandes reçues</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">Aucune commande pour le moment</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition"
                      >
                        <div className="flex-1">
                          <p className="font-semibold">Commande #{order.order_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.delivery_address} - {order.delivery_city}
                          </p>
                          <p className="text-sm font-medium mt-1">{order.total_amount} TND</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              order.status === "delivered"
                                ? "bg-green-100 text-green-800"
                                : order.status === "shipped"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {order.status}
                          </span>
                          <Link href={`/vendeur/commande/${order.id}`}>
                            <Button variant="outline" size="sm">
                              Détails
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres du Magasin</CardTitle>
                <CardDescription>Informations de votre magasin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {seller && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Nom du magasin</p>
                      <p className="font-semibold">{seller.business_name}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-semibold">{seller.email}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Téléphone</p>
                      <p className="font-semibold">{seller.phone}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Statut de vérification</p>
                      <p className={`font-semibold ${seller.is_verified ? "text-green-600" : "text-yellow-600"}`}>
                        {seller.is_verified ? "Vérifié" : "En attente de vérification"}
                      </p>
                    </div>
                    <Separator />
                    <Link href="/vendeur/parametres">
                      <Button className="w-full">Éditer les paramètres</Button>
                    </Link>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
