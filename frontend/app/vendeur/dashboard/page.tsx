"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Star,
  Plus,
  Eye,
  Settings,
  LogOut,
  CheckCircle2,
  Clock,
  BarChart3,
  Store,
  ArrowUpRight,
  AlertTriangle,
  XCircle,
} from "lucide-react"
import { authService } from "@/services/auth.service"
import { ordersService } from "@/services/orders.service"
import type { Product, Order } from "@/lib/types"

interface DashboardStats {
  totalProducts: number
  availableProducts: number
  outOfStock: number
  lowStock: number
  totalOrders: number
  totalRevenue: number
  averageRating: number
}

export default function VendeurDashboard() {
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [recentProducts, setRecentProducts] = useState<Product[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    availableProducts: 0,
    outOfStock: 0,
    lowStock: 0,
    totalOrders: 0,
    totalRevenue: 0,
    averageRating: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const currentUser = authService.getCurrentUser()

      if (!currentUser) {
        router.push("/auth/login?next=/vendeur/dashboard")
        return
      }

      if (currentUser.role !== "SELLER") {
        router.push("/profil")
        return
      }

      setUser(currentUser)

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

      const res = await fetch(
        `${API_URL}/api/products?seller_id=${currentUser.id}`,
        { cache: "no-store" }
      )

      const json = await res.json()
      const products: Product[] = json.data || []

      const sellerOrders: Order[] = await ordersService.getSellerOrders(currentUser.id)
      setRecentOrders(sellerOrders.slice(0, 5))

      const availableProducts = products.filter(
        (p: any) => p.is_available !== false && Number(p.stock ?? 1) > 0
      ).length

      const outOfStock = products.filter(
        (p: any) => Number(p.stock ?? 1) === 0
      ).length

      const lowStock = products.filter((p: any) => {
        const stock = Number(p.stock ?? 999)
        return stock > 0 && stock <= 5
      }).length

      setStats({
        totalProducts: products.length,
        availableProducts,
        outOfStock,
        lowStock,
        totalOrders: sellerOrders.length,
        totalRevenue: sellerOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0),
        averageRating: 0,
      })

      setRecentProducts(products.slice(0, 5))
    } catch (error) {
      console.error("Erreur dashboard vendeur:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    authService.logout()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm leading-none">
                {user?.name || "Espace vendeur"}
              </p>
              <p className="text-xs text-muted-foreground">Espace Vendeur</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <Link href="/vendeur/dashboard" className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm bg-muted">
              <BarChart3 className="w-4 h-4" />
              Tableau de bord
            </Link>
            <Link href="/vendeur/produits" className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted">
              <Package className="w-4 h-4" />
              Produits
            </Link>
            <Link href="/vendeur/profil" className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted">
              <Settings className="w-4 h-4" />
              Profil
            </Link>
          </nav>

          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-1" />
            Déconnexion
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">
              Bonjour, {user?.name} 👋
            </h1>
            <p className="text-muted-foreground text-sm">
              Voici un aperçu de votre activité vendeur.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-700 border border-green-200 gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Compte vendeur
            </Badge>

            <Button asChild size="sm">
              <Link href="/vendeur/produits/ajouter">
                <Plus className="w-4 h-4 mr-1" />
                Ajouter un produit
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <Package className="w-6 h-6 text-blue-600 mb-3" />
              <p className="text-2xl font-bold">{stats.totalProducts}</p>
              <p className="text-xs text-muted-foreground">Total produits</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <CheckCircle2 className="w-6 h-6 text-green-600 mb-3" />
              <p className="text-2xl font-bold">{stats.availableProducts}</p>
              <p className="text-xs text-muted-foreground">Produits disponibles</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <XCircle className="w-6 h-6 text-red-600 mb-3" />
              <p className="text-2xl font-bold">{stats.outOfStock}</p>
              <p className="text-xs text-muted-foreground">Rupture de stock</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600 mb-3" />
              <p className="text-2xl font-bold">{stats.lowStock}</p>
              <p className="text-xs text-muted-foreground">Stock faible</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Commandes récentes</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/vendeur/commandes" className="text-primary text-xs">
                    Voir tout <ArrowUpRight className="w-3 h-3 ml-1 inline" />
                  </Link>
                </Button>
              </CardHeader>

              <CardContent>
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Aucune commande pour l'instant</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between border rounded-lg p-3">
                        <div>
                          <p className="text-sm font-medium">{order.order_number}</p>
                          <p className="text-xs text-muted-foreground">{order.delivery_city}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{Number(order.total_amount).toFixed(3)} TND</p>
                          <p className="text-xs text-muted-foreground">{order.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Mes produits récents</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/vendeur/produits" className="text-primary text-xs">
                    Gérer
                  </Link>
                </Button>
              </CardHeader>

              <CardContent>
                {recentProducts.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm mb-3">Aucun produit</p>
                    <Button size="sm" asChild>
                      <Link href="/vendeur/produits/ajouter">
                        <Plus className="w-4 h-4 mr-1" />
                        Ajouter
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentProducts.map((product: any) => (
                      <div key={product.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={product.image_url || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {Number(product.price || 0).toFixed(3)} {product.currency || "DT"}
                          </p>
                        </div>

                        <Button variant="ghost" size="icon" className="w-7 h-7" asChild>
                          <Link href={`/produits/${product.id}`}>
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                      </div>
                    ))}

                    <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                      <Link href="/vendeur/produits/ajouter">
                        <Plus className="w-4 h-4 mr-1" />
                        Nouveau produit
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="md:hidden grid grid-cols-2 gap-3 pb-24">
          <Link href="/vendeur/produits" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-background border shadow-sm">
            <Package className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium">Mes produits</span>
          </Link>

          <Link href="/vendeur/produits/ajouter" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-background border shadow-sm">
            <Plus className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium">Ajouter</span>
          </Link>

          <Link href="/vendeur/profil" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-background border shadow-sm">
            <Settings className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium">Profil</span>
          </Link>

          <Link href="/" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-background border shadow-sm">
            <Store className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Site public</span>
          </Link>
        </div>
      </main>
    </div>
  )
}