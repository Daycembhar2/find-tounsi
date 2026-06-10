import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, ShoppingBag, Star, User, LogOut } from "lucide-react"
import Link from "next/link"

export default async function ProfilPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If not logged in, show login prompt
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        

        <main className="flex-1 pb-20 md:pb-8">
          <div className="container px-4 py-12">
            <div className="max-w-md mx-auto text-center">
              <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h1 className="text-2xl font-bold mb-2">Mon Profil</h1>
              <p className="text-muted-foreground mb-6">
                Connectez-vous pour accéder à vos favoris et personnaliser votre expérience
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

  // Fetch user favorites
  const { data: favorites } = await supabase
    .from("favorites")
    .select("*, products(*, brands(*))")
    .eq("user_id", user.id)

  // Fetch user reviews
  const { data: reviews } = await supabase.from("reviews").select("*, products(name)").eq("user_id", user.id)

  return (
    <div className="min-h-screen flex flex-col">
      

      <main className="flex-1 pb-20 md:pb-8">
        <div className="container px-4 py-6">
          {/* Profile Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Mon Profil</CardTitle>
                  <CardDescription className="mt-1">{user.email}</CardDescription>
                </div>
                <form action="/auth/logout" method="post">
                  <Button variant="outline" size="sm" type="submit">
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </Button>
                </form>
              </div>
            </CardHeader>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <Heart className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{favorites?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Favoris</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Star className="h-8 w-8 mx-auto mb-2 text-accent" />
                <p className="text-2xl font-bold">{reviews?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Avis</p>
              </CardContent>
            </Card>
          </div>

          {/* Favorites */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Mes Favoris</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/favoris">Voir tout</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {favorites && favorites.length > 0 ? (
                <div className="space-y-3">
                  {favorites.slice(0, 3).map((fav: any) => (
                    <Link
                      key={fav.id}
                      href={`/produits/${fav.product_id}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="h-12 w-12 rounded bg-muted flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{fav.products?.name}</p>
                        <p className="text-sm text-muted-foreground">{fav.products?.brands?.name}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-6">Aucun favori pour le moment</p>
              )}
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
                  <Link href="/favoris">
                    <Heart className="h-4 w-4 mr-2" />
                    Mes Favoris
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/produits">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Parcourir les Produits
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
