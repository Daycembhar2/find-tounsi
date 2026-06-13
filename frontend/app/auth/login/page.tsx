"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { authService } from "@/services/auth.service"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // On récupère la réponse de la connexion (contenant l'utilisateur et son rôle)
      const response = await authService.login({ email, password })

      // Extrait le rôle : selon la structure retournée par votre API
      // Suppose que response = { user: { role: 'SELLER' } } ou { role: 'SELLER' }
      const role = response.user?.role || response.role

      // Redirection selon le rôle
      if (role === "SELLER") {
        router.push("/vendeur/dashboard")
      } else if (role === "ADMIN") {
        router.push("/admin/dashboard")
      } else {
        // Rôle par défaut : USER (ou tout autre rôle non spécifié)
        router.push("/")
      }

      router.refresh() // Rafraîchit les composants serveur (si vous utilisez Next.js App Router)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Email ou mot de passe incorrect")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Connexion</CardTitle>
              <CardDescription>Connectez-vous à votre compte FindTounsi</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="exemple@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Connexion..." : "Se connecter"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  Pas de compte ?{" "}
                  <Link href="/auth/sign-up" className="underline underline-offset-4">
                    S'inscrire
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}