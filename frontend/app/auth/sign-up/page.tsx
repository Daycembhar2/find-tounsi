"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function SignUpPage() {
  const router = useRouter()

  // ------------ State ------------
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [userRole, setUserRole] = useState<"consumer" | "seller">("consumer")
  const [businessName, setBusinessName] = useState("")
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // ------------ Validation ------------
  const validatePhone = (phone: string) => /^\+216\d{8}$/.test(phone)

  const validateInputs = () => {
    if (!fullName || !phone || !email || !password || !confirmPassword) return "Veuillez remplir tous les champs"
    if (password !== confirmPassword) return "Les mots de passe ne correspondent pas"
    if (password.length < 8) return "Le mot de passe doit contenir au moins 8 caractères"
    if (userRole === "seller" && !businessName) return "Veuillez entrer le nom de votre entreprise"
    if (!validatePhone(phone)) return "Le numéro doit commencer par +216 et contenir exactement 8 chiffres."
    return null
  }

  // ------------ Inscription avec email + mot de passe ------------
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateInputs()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)

      const supabase = createClient()
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/login`,
        },
      })

      if (signUpError) throw signUpError

      setSuccess(`Compte créé ! Veuillez vérifier votre email pour confirmer votre inscription.`)

      // Si l'utilisateur est déjà confirmé, créer son profil
      if (data?.user?.confirmed_at) {
        await createUserProfile(data.user.id)
        router.push(userRole === "seller" ? "/vendeur/tableau-bord" : "/profil")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création du compte")
    } finally {
      setIsLoading(false)
    }
  }

  // ------------ Création du profil utilisateur ------------
  const createUserProfile = async (userId: string) => {
    const supabase = createClient()

    await supabase.from("user_profiles").insert({
      id: userId,
      full_name: fullName,
      phone_number: phone,
      user_role: userRole,
    })

    if (userRole === "seller") {
      await supabase.from("sellers").insert({
        id: userId,
        business_name: businessName,
        phone,
        email,
        address: "",
        city: "",
        is_verified: false,
      })
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">FindTounsi</h1>
          <p className="text-muted-foreground">Rejoignez notre communauté tunisienne</p>
        </div>

        <Tabs value={userRole} onValueChange={(v) => setUserRole(v as "consumer" | "seller")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="consumer">Client</TabsTrigger>
            <TabsTrigger value="seller">Vendeur</TabsTrigger>
          </TabsList>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Inscription</CardTitle>
              <CardDescription>
                {userRole === "consumer" ? "Découvrez les produits tunisiens" : "Vendez vos produits tunisiens"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp} className="flex flex-col gap-4">
                <InputField label="Nom complet" id="fullName" value={fullName} setValue={setFullName} required />
                <InputField label="Téléphone" id="phone" type="tel" value={phone} setValue={setPhone} required />
                {userRole === "seller" && (
                  <InputField label="Nom de l'entreprise" id="businessName" value={businessName} setValue={setBusinessName} required />
                )}
                <InputField label="Email" id="email" type="email" value={email} setValue={setEmail} required />
                <InputField label="Mot de passe" id="password" type="password" value={password} setValue={setPassword} required />
                <InputField label="Confirmer le mot de passe" id="confirmPassword" type="password" value={confirmPassword} setValue={setConfirmPassword} required />

                <FormMessage error={error} success={success} />

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
        </Tabs>
      </div>
    </div>
  )
}

// ------------------ Composants utilitaires ------------------
function InputField({ label, id, value, setValue, type = "text", required, placeholder }: { label: string; id: string; value: string; setValue: (val: string) => void; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} placeholder={placeholder} value={value} onChange={(e) => setValue(e.target.value)} required={required} />
    </div>
  )
}

function FormMessage({ error, success }: { error?: string | null; success?: string | null }) {
  if (!error && !success) return null
  return (
    <div className={`flex gap-2 text-sm p-3 rounded-lg ${error ? "text-destructive bg-destructive/10" : "text-green-600 bg-green-50"}`}>
      {error ? <AlertCircle className="w-4 h-4 mt-0.5" /> : <CheckCircle2 className="w-4 h-4 mt-0.5" />}
      {error || success}
    </div>
  )
}
