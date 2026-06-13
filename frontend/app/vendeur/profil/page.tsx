"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LayoutDashboard, PackagePlus, Package, LogOut, Store } from "lucide-react"
import { authService } from "@/services/auth.service"

export default function VendeurProfilPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()

    if (!currentUser) {
      router.push("/auth/login")
      return
    }

    if (currentUser.role !== "SELLER") {
      router.push("/profil")
      return
    }

    setUser(currentUser)
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    authService.logout()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Store className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Profil vendeur</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2 text-center">
            <p className="text-sm text-muted-foreground">Nom vendeur</p>
            <p className="font-medium">{user?.name}</p>

            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{user?.email}</p>

            <p className="text-sm text-muted-foreground">Rôle</p>
            <p className="font-medium text-primary">{user?.role}</p>
          </div>

          <div className="space-y-2">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/vendeur/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard vendeur
              </Link>
            </Button>

            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/vendeur/produits">
                <Package className="mr-2 h-4 w-4" />
                Mes produits
              </Link>
            </Button>

            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/vendeur/produits/ajouter">
                <PackagePlus className="mr-2 h-4 w-4" />
                Ajouter un produit
              </Link>
            </Button>

            <Button onClick={handleLogout} className="w-full justify-start" variant="destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}