"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type React from "react"
import { authService } from "@/services/auth.service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function SignUpPage() {
  const router = useRouter()

  const [name, setName]                   = useState("")
  const [email, setEmail]                 = useState("")
  const [password, setPassword]           = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [success, setSuccess]             = useState<string | null>(null)
  const [error, setError]                 = useState<string | null>(null)
  const [isLoading, setIsLoading]         = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!name || !email || !password || !confirmPassword) {
      setError("Veuillez remplir tous les champs")
      return
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      return
    }

    try {
      setIsLoading(true)
      await authService.register({ name, email, password })
      setSuccess("Compte créé avec succès !")
      setTimeout(() => router.push("/profil"), 1000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création du compte")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">FindTounsi</h1>
          <p className="text-muted-foreground">Rejoignez notre communauté tunisienne 🇹🇳</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Inscription</CardTitle>
            <CardDescription>Découvrez les produits tunisiens authentiques</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="flex flex-col gap-4">

              <div className="grid gap-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input id="name" type="text" placeholder="Votre nom" value={name}
                  onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="exemple@email.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input id="password" type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)} required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>

              {error && (
                <div className="flex gap-2 text-sm p-3 rounded-lg text-destructive bg-destructive/10">
                  <AlertCircle className="w-4 h-4 mt-0.5" />
                  {error}
                </div>
              )}

              {success && (
                <div className="flex gap-2 text-sm p-3 rounded-lg text-green-600 bg-green-50">
                  <CheckCircle2 className="w-4 h-4 mt-0.5" />
                  {success}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Création du compte..." : "S'inscrire"}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm">
              Déjà un compte ?{" "}
              <Link href="/auth/login" className="text-primary underline underline-offset-4">
                Se connecter
              </Link>
            </p>
          </CardContent>
        </Card>
        <p className="text-center mt-4">
  Vous êtes une entreprise ?
  <Link
    href="/vendeur/inscription"
    className="text-primary ml-1 underline"
  >
    Devenir vendeur
  </Link>
</p>
      </div>
    </div>
  )
}