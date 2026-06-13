"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { authService } from "@/services/auth.service"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft, Upload, X, CheckCircle2, AlertCircle,
  ImagePlus, Barcode, MapPin, Tag, Package, Info,
} from "lucide-react"
import type { Category, Region } from "@/lib/types"

const UNITS = [
  { value: "g",   label: "Grammes (g)" },
  { value: "kg",  label: "Kilogrammes (kg)" },
  { value: "ml",  label: "Millilitres (ml)" },
  { value: "l",   label: "Litres (l)" },
  { value: "pcs", label: "Pièces (pcs)" },
  { value: "m",   label: "Mètres (m)" },
  { value: "m2",  label: "Mètres² (m²)" },
]

export default function AjouterProduitPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [sellerId, setSellerId] = useState<string | null>(null)

  // Données formulaire
  const [name, setName]                   = useState("")
  const [nameAr, setNameAr]               = useState("")
  const [description, setDescription]     = useState("")
  const [descriptionAr, setDescriptionAr] = useState("")
  const [price, setPrice]                 = useState("")
  const [stock, setStock]                 = useState("")
  const [barcode, setBarcode]             = useState("")
  const [categoryId, setCategoryId]       = useState("")
  const [regionId, setRegionId]           = useState("")
  const [quantityValue, setQuantityValue] = useState("")
  const [quantityUnit, setQuantityUnit]   = useState("g")
  const [ingredients, setIngredients]     = useState("")
  const [isTunisian, setIsTunisian]       = useState(true)
  const [isAvailable, setIsAvailable]     = useState(true)

  // Images
  const [images, setImages]       = useState<File[]>([])
  const [previews, setPreviews]   = useState<string[]>([])

  // Données externes
  const [categories, setCategories] = useState<Category[]>([])
  const [regions, setRegions]       = useState<Region[]>([])

  // UI
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [success, setSuccess]     = useState(false)

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    const user = authService.getCurrentUser()
    if (!user) { router.push("/auth/login"); return }
    if (user.role !== "SELLER") { router.push("/profil"); return }

    setSellerId(user.id)

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    const [catRes, regRes] = await Promise.all([
      fetch(`${API_URL}/api/categories`),
      fetch(`${API_URL}/api/regions`),
    ])

    const catJson = await catRes.json()
    const regJson = await regRes.json()
    if (catJson.data) setCategories(catJson.data as Category[])
    if (regJson.data) setRegions(regJson.data as Region[])
  }

  // Gestion images
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (images.length + files.length > 5) {
      setError("Maximum 5 images autorisées")
      return
    }
    const newImages = [...images, ...files]
    setImages(newImages)
    const newPreviews = files.map((f) => URL.createObjectURL(f))
    setPreviews((prev) => [...prev, ...newPreviews])
  }

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index])
    setImages((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = []
    for (const image of images) {
      urls.push(await fileToDataUrl(image))
    }
    return urls
  }

  const validate = (): boolean => {
    setError(null)
    if (!name.trim())        { setError("Le nom du produit est obligatoire"); return false }
    if (!description.trim()) { setError("La description est obligatoire"); return false }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setError("Veuillez entrer un prix valide"); return false
    }
    if (!categoryId)         { setError("Veuillez choisir une catégorie"); return false }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !sellerId) return

    try {
      setIsLoading(true)
      setError(null)

      const user = authService.getCurrentUser()
      if (!user) throw new Error("Non authentifié")

      const imageUrls = images.length > 0 ? await uploadImages() : []
      const mainImage = imageUrls[0] || null

      await api.post("/api/products", {
        name: name.trim(),
        name_ar: nameAr.trim() || null,
        description: description.trim(),
        price: Number(price),
        stock: stock ? Number(stock) : null,
        barcode: barcode.trim() || null,
        category_id: categoryId || null,
        region_id: regionId || null,
        image_url: mainImage,
        images: imageUrls,
        is_100_percent_tunisian: isTunisian,
        is_available: isAvailable,
      })

      setSuccess(true)
      setTimeout(() => router.push("/vendeur/produits"), 1800)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'ajout du produit")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-10">

      {/* ─── Header ─── */}
      <div className="bg-background border-b sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href="/vendeur/produits"><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <div>
            <h1 className="font-semibold text-base leading-none">Ajouter un produit</h1>
            <p className="text-xs text-muted-foreground">Remplissez les informations</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* ─── Images ─── */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ImagePlus className="w-4 h-4 text-primary" /> Photos du produit
            </CardTitle>
            <CardDescription className="text-xs">Max 5 photos · La première sera l'image principale</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              {previews.map((src, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border bg-muted group">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  {i === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 bg-primary/80 text-white text-[9px] text-center py-0.5">
                      Principale
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}

              {images.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 hover:border-primary hover:bg-primary/5 transition-colors text-muted-foreground hover:text-primary"
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-[10px]">Ajouter</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>
          </CardContent>
        </Card>

        {/* ─── Informations de base ─── */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" /> Informations de base
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="name">Nom du produit (FR) *</Label>
                <Input id="name" placeholder="Ex: Huile d'olive extra vierge"
                  value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="nameAr">Nom en arabe</Label>
                <Input id="nameAr" placeholder="اسم المنتج" dir="rtl"
                  value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="description">Description (FR) *</Label>
              <Textarea id="description" rows={3}
                placeholder="Décrivez votre produit : origine, qualité, utilisation..."
                value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="descriptionAr">Description en arabe</Label>
              <Textarea id="descriptionAr" rows={2} dir="rtl"
                placeholder="وصف المنتج بالعربية"
                value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="ingredients">Ingrédients / Composition</Label>
              <Textarea id="ingredients" rows={2}
                placeholder="Ex: Olives tunisiennes, sel..."
                value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* ─── Prix & Stock ─── */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUpIcon /> Prix & Stock
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="price">Prix (TND) *</Label>
                <div className="relative">
                  <Input id="price" type="number" step="0.001" min="0"
                    placeholder="0.000"
                    value={price} onChange={(e) => setPrice(e.target.value)}
                    className="pr-14" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">TND</span>
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="stock">Stock disponible</Label>
                <Input id="stock" type="number" min="0" placeholder="Optionnel"
                  value={stock} onChange={(e) => setStock(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="quantityValue">Quantité / Contenance</Label>
                <Input id="quantityValue" type="number" step="0.1" min="0"
                  placeholder="Ex: 500"
                  value={quantityValue} onChange={(e) => setQuantityValue(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <Label>Unité</Label>
                <Select value={quantityUnit} onValueChange={setQuantityUnit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => (
                      <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Classification ─── */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" /> Classification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label>Catégorie *</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Région d'origine
                </Label>
                <Select value={regionId} onValueChange={setRegionId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une région" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((r) => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="barcode" className="flex items-center gap-1">
                <Barcode className="w-3 h-3" /> Code-barres (EAN-13)
              </Label>
              <Input id="barcode" placeholder="Ex: 6191234567890"
                value={barcode} onChange={(e) => setBarcode(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* ─── Options ─── */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" /> Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
              <div>
                <p className="text-sm font-medium flex items-center gap-2">
                  🇹🇳 Produit 100% Tunisien
                </p>
                <p className="text-xs text-muted-foreground">Fabriqué entièrement en Tunisie</p>
              </div>
              <Switch checked={isTunisian} onCheckedChange={setIsTunisian} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
              <div>
                <p className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" /> Disponible à la vente
                </p>
                <p className="text-xs text-muted-foreground">Visible et achetable par les clients</p>
              </div>
              <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
            </div>
          </CardContent>
        </Card>

        {/* ─── Messages ─── */}
        {error && (
          <div className="flex items-start gap-2 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-green-50 text-green-700 text-sm">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            Produit ajouté avec succès ! Redirection...
          </div>
        )}

        {/* ─── Actions ─── */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" asChild>
            <Link href="/vendeur/produits">Annuler</Link>
          </Button>
          <Button type="submit" className="flex-1" disabled={isLoading || success}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Enregistrement...
              </span>
            ) : (
              "Publier le produit"
            )}
          </Button>
        </div>

      </form>
    </div>
  )
}

// Icône inline pour éviter un import supplémentaire
function TrendingUpIcon() {
  return (
    <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}