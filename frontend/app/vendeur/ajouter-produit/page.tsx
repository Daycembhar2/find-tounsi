"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function AddProductPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [ingredients, setIngredients] = useState("")
  const [price, setPrice] = useState("")
  const [quantity, setQuantity] = useState("")
  const [quantityUnit, setQuantityUnit] = useState("g")
  const [barcode, setBarcode] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Vous devez être connecté")
      }

      let imageUrl = null
      if (image) {
        const timestamp = Date.now()
        const fileName = `${timestamp}-${image.name}`
        const { error: uploadError, data } = await supabase.storage
          .from("product-images")
          .upload(`${user.id}/${fileName}`, image)

        if (uploadError) throw uploadError

        // Get public URL
        const { data: publicUrl } = supabase.storage.from("product-images").getPublicUrl(`${user.id}/${fileName}`)

        imageUrl = publicUrl?.publicUrl
      }

      const { error: insertError } = await supabase.from("products").insert({
        name,
        description,
        ingredients,
        price: Number.parseFloat(price),
        quantity_value: Number.parseFloat(quantity),
        quantity_unit: quantityUnit,
        barcode,
        category_id: categoryId || null,
        seller_id: user.id,
        image_url: imageUrl,
        is_100_percent_tunisian: true,
        status: "active",
      })

      if (insertError) throw insertError

      setSuccess(true)
      setTimeout(() => {
        router.push("/vendeur/tableau-bord")
        router.refresh()
      }, 1500)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erreur lors de l'ajout du produit")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Ajouter un Produit</h1>
          <p className="text-muted-foreground">Remplissez les informations de votre produit tunisien</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleAddProduct} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 grid gap-2">
                  <Label htmlFor="name">Nom du produit *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Lait Délice 1L"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="md:col-span-2 grid gap-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez votre produit..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="md:col-span-2 grid gap-2">
                  <Label htmlFor="ingredients">Ingrédients</Label>
                  <Textarea
                    id="ingredients"
                    placeholder="Listez les ingrédients..."
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="price">Prix (TND) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.001"
                    placeholder="0.000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="barcode">Code-barres</Label>
                  <Input
                    id="barcode"
                    placeholder="EAN-13"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantité *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.1"
                    placeholder="500"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="unit">Unité *</Label>
                  <Select value={quantityUnit} onValueChange={setQuantityUnit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">Grammes (g)</SelectItem>
                      <SelectItem value="kg">Kilogrammes (kg)</SelectItem>
                      <SelectItem value="ml">Millilitres (ml)</SelectItem>
                      <SelectItem value="l">Litres (l)</SelectItem>
                      <SelectItem value="pcs">Pièces (pcs)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2 grid gap-2">
                  <Label htmlFor="image">Image du produit</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              {error && (
                <div className="flex gap-2 text-sm text-destructive p-4 bg-destructive/10 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              {success && (
                <div className="flex gap-2 text-sm text-green-600 p-4 bg-green-50 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  Produit ajouté avec succès! Redirection...
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Ajout en cours..." : "Ajouter le produit"}
                </Button>
                <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={() => router.back()}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
