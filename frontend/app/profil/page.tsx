"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Heart, ShoppingBag, User, LogOut } from "lucide-react"
import Link from "next/link"
import { authService } from "@/services/auth.service"

export default function ProfilPage() {
  const router  = useRouter()
  const [user, setUser]       = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      router.push("/auth/login")
      return
    }
    setUser(currentUser)
    setLoading(false)

    // Redirection selon le rôle
    if (currentUser.role === "SELLER") {
      router.replace("/vendeur/profil")
    } else if (currentUser.role === "ADMIN") {
      router.replace("/admin/profil")
    }
    // Pour USER (ou autre rôle), on reste sur cette page
  }, [router])

  const handleLogout = () => {
    authService.logout()
    router.push("/auth/login")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 pb-20 md:pb-8">
          <div className="container px-4 py-12">
            <div className="max-w-md mx-auto text-center">
              <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h1 className="text-2xl font-bold mb-2">Mon Profil</h1>
              <p className="text-muted-foreground mb-6">
                Connectez-vous pour accéder à votre compte
              </p>
              <div className="flex flex-col gap-3">
                <Button asChild>
                  <Link href="/auth/login">Se connecter</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/auth/sign-up">Créer un compte</Link>
                </Button>
              </div>
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pb-20 md:pb-8">
        <div className="container px-4 py-6">

          {/* Profile Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{user.name}</CardTitle>
                  <CardDescription className="mt-1">{user.email}</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Role Badge */}
          <Card className="mb-6">
            <CardContent className="pt-6 text-center">
              <User className="h-12 w-12 mx-auto mb-2 text-primary" />
              <p className="text-lg font-semibold">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.role}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Membre depuis {new Date(user.created_at).toLocaleDateString('fr-FR')}
              </p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/scanner">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Scanner un produit
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/produits">
                    <Heart className="h-4 w-4 mr-2" />
                    Parcourir les produits
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
      <BottomNav />
    </div>
  )
}