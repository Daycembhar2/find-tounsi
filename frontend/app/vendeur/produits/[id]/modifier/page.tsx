"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import api from "@/lib/api"
import { authService } from "@/services/auth.service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, AlertCircle, CheckCircle2, Package, Barcode, Tag, MapPin } from "lucide-react"

export default function ModifierProduitPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [categories, setCategories] = useState<any[]>([])
  const [regions, setRegions] = useState<any[]>([])

  const [name, setName] = useState("")
  const [nameAr, setNameAr] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("")
  const [barcode, setBarcode] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [regionId, setRegionId] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [isTunisian, setIsTunisian] = useState(true)
  const [isAvailable, setIsAvailable] = useState(true)

  useEffect(() => {
    loadData()
  }, [productId])

  const loadData = async () => {
    try {
      const user = authService.getCurrentUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      if (user.role !== "SELLER") {
        router.push("/profil")
        return
      }

      const [productRes, categoriesRes, regionsRes] = await Promise.all([
        api.get(`/api/products/${productId}`),
        api.get("/api/categories"),
        api.get("/api/regions"),
      ])

      const product = productRes.data.data

      setName(product.name || "")
      setNameAr(product.name_ar || "")
      setDescription(product.description || "")
      setPrice(product.price?.toString() || "")
      setStock(product.stock?.toString() || "")
      setBarcode(product.barcode || "")
      setCategoryId(product.category_id || "")
      setRegionId(product.region_id || "")
      setImageUrl(product.image_url || "")
      setIsTunisian(product.is_100_percent_tunisian ?? true)
      setIsAvailable(product.is_available ?? true)

      setCategories(categoriesRes.data.data || [])
      setRegions(regionsRes.data.data || [])
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur de chargement")
    } finally {
      setIsLoading(false)
    }
  }

  const validate = () => {
    setError(null)

    if (!name.trim()) {
      setError("Le nom est obligatoire")
      return false
    }

    if (!description.trim()) {
      setError("La description est obligatoire")
      return false
    }

    if (!price || Number(price) <= 0) {
      setError("Le prix est invalide")
      return false
    }

    if (!categoryId) {
      setError("La catégorie est obligatoire")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    try {
      setIsSaving(true)
      setError(null)

      const payload = {
        name: name.trim(),
        name_ar: nameAr.trim() || null,
        description: description.trim(),
        price: Number(price),
        stock: stock !== "" ? Number(stock) : null,
        barcode: barcode.trim() || null,
        category_id: categoryId || null,
        region_id: regionId || null,
        image_url: imageUrl.trim() || null,
        images: imageUrl.trim() ? [imageUrl.trim()] : [],
        is_100_percent_tunisian: isTunisian,
        is_available: isAvailable,
      }

      const res = await api.put(`/api/products/${productId}`, payload)

      if (!res.data.success) {
        throw new Error(res.data.error || "Erreur modification")
      }

      setSuccess(true)

      setTimeout(() => {
        router.push("/vendeur/produits")
      }, 1200)
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Erreur lors de la mise à jour")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-10">
      <div className="bg-background border-b sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href="/vendeur/produits">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>

          <div>
            <h1 className="font-semibold text-base leading-none">
              Modifier produit
            </h1>
            <p className="text-xs text-muted-foreground">
              Mettre à jour prix, stock et disponibilité
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              Informations produit
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-1.5">
              <Label>Nom du produit *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="grid gap-1.5">
              <Label>Nom en arabe</Label>
              <Input dir="rtl" value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
            </div>

            <div className="grid gap-1.5">
              <Label>Description *</Label>
              <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="grid gap-1.5">
              <Label>Image URL</Label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="/image/produit.jpg"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Prix & Stock</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label>Prix TND *</Label>
                <Input
                  type="number"
                  step="0.001"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div className="grid gap-1.5">
                <Label>Stock</Label>
                <Input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
              <div>
                <p className="text-sm font-medium">Disponible à la vente</p>
                <p className="text-xs text-muted-foreground">
                  Si stock = 0, produit sera considéré en rupture.
                </p>
              </div>
              <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" />
              Classification
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-1.5">
              <Label>Catégorie *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Région
              </Label>
              <Select value={regionId} onValueChange={setRegionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une région" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label className="flex items-center gap-1">
                <Barcode className="w-3 h-3" />
                Code-barres
              </Label>
              <Input value={barcode} onChange={(e) => setBarcode(e.target.value)} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
              <div>
                <p className="text-sm font-medium">🇹🇳 Produit 100% Tunisien</p>
                <p className="text-xs text-muted-foreground">
                  Produit fabriqué en Tunisie
                </p>
              </div>
              <Switch checked={isTunisian} onCheckedChange={setIsTunisian} />
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="flex items-start gap-2 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-green-50 text-green-700 text-sm">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            Produit mis à jour avec succès.
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" asChild>
            <Link href="/vendeur/produits">Annuler</Link>
          </Button>

          <Button type="submit" className="flex-1" disabled={isSaving || success}>
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </div>
  )
}