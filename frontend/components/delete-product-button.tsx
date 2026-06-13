"use client"

import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"

export function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm("Supprimer ce produit définitivement ?")) return

    await api.delete(`/api/products/${productId}`)
    router.refresh()
  }

  return (
    <Button variant="destructive" onClick={handleDelete}>
      <Trash2 className="w-4 h-4" />
    </Button>
  )
}