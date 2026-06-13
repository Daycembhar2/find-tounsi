"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Plus, Search, Eye, Pencil, Trash2, Package,
  ArrowLeft, CheckCircle2, XCircle, Filter,
  MoreVertical, TrendingUp,
} from "lucide-react"
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Product } from "@/lib/types"

type FilterStatus = "all" | "active" | "inactive"

export default function VendeurProduitsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [products, setProducts] = useState<Product[]>([])
  const [filtered, setFiltered] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [sellerId, setSellerId] = useState<string | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [products, search, statusFilter])

  const loadProducts = async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/auth/login"); return }

      const { data: seller } = await supabase
        .from("sellers").select("id").eq("user_id", user.id).single()
      if (!seller) { router.push("/vendeur/inscription"); return }

      setSellerId(seller.id)

      const { data } = await supabase
        .from("products")
        .select("*, category:categories(name, slug), region:regions(name)")
        .eq("seller_id", seller.id)
        .order("created_at", { ascending: false })

      setProducts((data as any) || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let result = [...products]
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.barcode?.toLowerCase().includes(q) ||
        p.category?.name?.toLowerCase().includes(q)
      )
    }
    if (statusFilter === "active")   result = result.filter((p) => p.is_available !== false)
    if (statusFilter === "inactive") result = result.filter((p) => p.is_available === false)
    setFiltered(result)
  }

  const toggleAvailability = async (product: Product) => {
    const newVal = !(product.is_available !== false)
    await supabase.from("products").update({ is_available: newVal }).eq("id", product.id)
    setProducts((prev) =>
      prev.map((p) => p.id === product.id ? { ...p, is_available: newVal } : p)
    )
  }

  const deleteProduct = async (id: string) => {
    if (!confirm("Supprimer ce produit définitivement ?")) return
    setDeletingId(id)
    await supabase.from("products").delete().eq("id", id)
    setProducts((prev) => prev.filter((p) => p.id !== id))
    setDeletingId(null)
  }

  // ─── Stats rapides ────────────────────────────────────────
  const totalActive   = products.filter((p) => p.is_available !== false).length
  const totalInactive = products.filter((p) => p.is_available === false).length
  const totalTunisian = products.filter((p) => p.is_100_percent_tunisian).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-24">

      {/* ─── Header ─── */}
      <div className="bg-background border-b sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push("/vendeur/dashboard")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="font-semibold text-base">Mes Produits</h1>
          </div>
          <Button size="sm" asChild>
            <Link href="/vendeur/produits/ajouter">
              <Plus className="w-4 h-4 mr-1" /> Ajouter
            </Link>
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-5 space-y-5">

        {/* ─── Mini stats ─── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total",       value: products.length,  color: "text-foreground" },
            { label: "En ligne",    value: totalActive,      color: "text-green-600" },
            { label: "🇹🇳 Tunisien", value: totalTunisian,   color: "text-red-600" },
          ].map((s) => (
            <Card key={s.label} className="border-none shadow-sm">
              <CardContent className="p-3 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ─── Recherche + Filtres ─── */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un produit..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(["all", "active", "inactive"] as FilterStatus[]).map((f) => (
                <DropdownMenuItem
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={statusFilter === f ? "font-semibold text-primary" : ""}
                >
                  {f === "all" ? "Tous" : f === "active" ? "En ligne" : "Hors ligne"}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* ─── Liste produits ─── */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Package className="w-14 h-14 mx-auto mb-3 opacity-25" />
            <p className="font-medium mb-1">
              {search ? "Aucun résultat" : "Aucun produit"}
            </p>
            <p className="text-sm mb-4">
              {search ? "Essayez un autre terme" : "Commencez par ajouter votre premier produit"}
            </p>
            {!search && (
              <Button asChild>
                <Link href="/vendeur/produits/ajouter">
                  <Plus className="w-4 h-4 mr-1" /> Ajouter un produit
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((product) => {
              const isActive = product.is_available !== false
              const price    = Number(product.price || 0)
              return (
                <Card key={product.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-3 p-3">

                      {/* Image */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={product.image_url || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }}
                        />
                      </div>

                      {/* Infos */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {(product.category as any)?.name || "Sans catégorie"}
                              {product.barcode && ` · ${product.barcode}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {product.is_100_percent_tunisian && (
                              <span className="text-sm" title="100% Tunisien">🇹🇳</span>
                            )}
                            <Badge
                              variant="outline"
                              className={`text-xs px-1.5 py-0 ${
                                isActive
                                  ? "border-green-200 text-green-700 bg-green-50"
                                  : "border-gray-200 text-gray-500 bg-gray-50"
                              }`}
                            >
                              {isActive ? (
                                <><CheckCircle2 className="w-2.5 h-2.5 mr-0.5 inline" />En ligne</>
                              ) : (
                                <><XCircle className="w-2.5 h-2.5 mr-0.5 inline" />Hors ligne</>
                              )}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <p className="font-bold text-primary text-sm">
                            {price.toFixed(3)} TND
                          </p>
                          {product.stock !== undefined && product.stock !== null && (
                            <p className="text-xs text-muted-foreground">
                              Stock : <span className={product.stock <= 5 ? "text-red-500 font-medium" : ""}>
                                {product.stock}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem asChild>
                            <Link href={`/produits/${product.id}`} className="flex items-center gap-2">
                              <Eye className="w-4 h-4" /> Voir la fiche
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/vendeur/produits/${product.id}/modifier`} className="flex items-center gap-2">
                              <Pencil className="w-4 h-4" /> Modifier
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toggleAvailability(product)}
                            className="flex items-center gap-2"
                          >
                            {isActive ? (
                              <><XCircle className="w-4 h-4" /> Désactiver</>
                            ) : (
                              <><CheckCircle2 className="w-4 h-4" /> Activer</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteProduct(product.id)}
                            className="flex items-center gap-2 text-destructive focus:text-destructive"
                            disabled={deletingId === product.id}
                          >
                            <Trash2 className="w-4 h-4" />
                            {deletingId === product.id ? "Suppression..." : "Supprimer"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}