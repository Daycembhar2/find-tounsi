"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle2, ArrowLeft, ArrowRight, Store, User, MapPin, FileText } from "lucide-react"

const GOUVERNORATS = [
  "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa",
  "Jendouba", "Kairouan", "Kasserine", "Kébili", "Kef", "Mahdia",
  "Manouba", "Médenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid",
  "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan",
]

const STEPS = [
  { id: 1, label: "Compte", icon: User },
  { id: 2, label: "Entreprise", icon: Store },
  { id: 3, label: "Localisation", icon: MapPin },
  { id: 4, label: "Documents", icon: FileText },
]

export default function VendeurInscriptionPage() {
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [phone, setPhone] = useState("")

  const [businessName, setBusinessName] = useState("")
  const [businessNameAr, setBusinessNameAr] = useState("")
  const [businessDescription, setBusinessDescription] = useState("")
  const [website, setWebsite] = useState("")
  const [category, setCategory] = useState("")

  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [gouvernorat, setGouvernorat] = useState("")
  const [postalCode, setPostalCode] = useState("")

  const [taxId, setTaxId] = useState("")
  const [bankName, setBankName] = useState("")
  const [bankAccount, setBankAccount] = useState("")
  const [logo, setLogo] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogo(file)

    const reader = new FileReader()
    reader.onload = () => setLogoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const validateStep = (): boolean => {
    setError(null)

    if (step === 1) {
      if (!name || !email || !password || !confirmPassword || !phone) {
        setError("Veuillez remplir tous les champs obligatoires")
        return false
      }

      if (password !== confirmPassword) {
        setError("Les mots de passe ne correspondent pas")
        return false
      }

      if (password.length < 8) {
        setError("Le mot de passe doit contenir au moins 8 caractères")
        return false
      }

      if (!/^\+?[0-9]{8,15}$/.test(phone.replace(/\s/g, ""))) {
        setError("Numéro de téléphone invalide")
        return false
      }
    }

    if (step === 2) {
      if (!businessName || !businessDescription || !category) {
        setError("Nom, description et catégorie sont obligatoires")
        return false
      }
    }

    if (step === 3) {
      if (!address || !city || !gouvernorat) {
        setError("Adresse, ville et gouvernorat sont obligatoires")
        return false
      }
    }

    return true
  }

  const nextStep = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, 4))
  }

  const prevStep = () => {
    setError(null)
    setStep((s) => Math.max(s - 1, 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep()) return

    try {
      setIsLoading(true)
      setError(null)

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

      const response = await fetch(`${API_URL}/api/sellers/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          business_name: businessName,
          business_description: businessDescription,
          address,
          city,
          region: gouvernorat,
        }),
      })

      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.message || "Erreur lors de l'inscription vendeur")
      }

      setSuccess(true)

      setTimeout(() => {
        router.push("/auth/login")
      }, 1500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
          </Link>
          <h1 className="text-3xl font-bold text-primary">🇹🇳 FindTounsi</h1>
          <p className="text-muted-foreground mt-1">Devenez vendeur et promouvez vos produits tunisiens</p>
        </div>

        <div className="flex items-center justify-between mb-8 px-4">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const isActive = step === s.id
            const isDone = step > s.id

            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    isDone ? "bg-primary border-primary text-white" :
                    isActive ? "border-primary text-primary bg-primary/10" :
                    "border-muted-foreground/30 text-muted-foreground/50"
                  }`}>
                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${
                    isActive ? "text-primary" : isDone ? "text-primary" : "text-muted-foreground/50"
                  }`}>
                    {s.label}
                  </span>
                </div>

                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-all ${isDone ? "bg-primary" : "bg-muted-foreground/20"}`} />
                )}
              </div>
            )
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "Informations du compte"}
              {step === 2 && "Informations de l'entreprise"}
              {step === 3 && "Localisation"}
              {step === 4 && "Documents & finalisation"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Créez votre compte vendeur"}
              {step === 2 && "Présentez votre entreprise aux acheteurs"}
              {step === 3 && "Indiquez l'emplacement de votre activité"}
              {step === 4 && "Informations légales et bancaires"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); nextStep() }}>
              <div className="space-y-4">
                {step === 1 && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nom complet *</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="phone">Téléphone *</Label>
                      <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="password">Mot de passe *</Label>
                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="confirmPassword">Confirmer *</Label>
                        <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                      </div>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="businessName">Nom de l'entreprise *</Label>
                      <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="businessNameAr">Nom en arabe</Label>
                      <Input id="businessNameAr" dir="rtl" value={businessNameAr} onChange={(e) => setBusinessNameAr(e.target.value)} />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="businessDescription">Description *</Label>
                      <Textarea id="businessDescription" rows={3} value={businessDescription} onChange={(e) => setBusinessDescription(e.target.value)} />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="category">Catégorie *</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alimentaire">Produits alimentaires</SelectItem>
                          <SelectItem value="artisanat">Artisanat & décoration</SelectItem>
                          <SelectItem value="cosmetique">Cosmétique & bien-être</SelectItem>
                          <SelectItem value="textile">Textile & vêtements</SelectItem>
                          <SelectItem value="agricole">Produits agricoles</SelectItem>
                          <SelectItem value="technologie">Technologie</SelectItem>
                          <SelectItem value="autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="website">Site web</Label>
                      <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="address">Adresse *</Label>
                      <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="city">Ville *</Label>
                        <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="postalCode">Code postal</Label>
                        <Input id="postalCode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="gouvernorat">Gouvernorat *</Label>
                      <Select value={gouvernorat} onValueChange={setGouvernorat}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir un gouvernorat" />
                        </SelectTrigger>
                        <SelectContent>
                          {GOUVERNORATS.map((g) => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {step === 4 && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="logo">Logo de l'entreprise</Label>
                      <div className="flex items-center gap-4">
                        {logoPreview && (
                          <img src={logoPreview} alt="Logo" className="w-16 h-16 rounded-full object-cover border" />
                        )}
                        <Input id="logo" type="file" accept="image/*" onChange={handleLogoChange} className="flex-1" />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="taxId">Matricule fiscal</Label>
                      <Input id="taxId" value={taxId} onChange={(e) => setTaxId(e.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="bankName">Banque</Label>
                        <Select value={bankName} onValueChange={setBankName}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir" />
                          </SelectTrigger>
                          <SelectContent>
                            {["STB", "BNA", "BH Bank", "Attijari", "BIAT", "UIB", "Amen Bank", "Zitouna", "Autre"].map((b) => (
                              <SelectItem key={b} value={b}>{b}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="bankAccount">RIB</Label>
                        <Input id="bankAccount" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} />
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
                      ⚠️ Votre compte sera examiné par notre équipe avant activation.
                    </div>
                  </>
                )}

                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {success && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 text-green-700 text-sm">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    Compte vendeur créé ! Redirection...
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  {step > 1 && (
                    <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Précédent
                    </Button>
                  )}

                  <Button type="submit" className="flex-1" disabled={isLoading || success}>
                    {step < 4 ? (
                      <><span>Suivant</span><ArrowRight className="w-4 h-4 ml-2" /></>
                    ) : isLoading ? (
                      "Inscription en cours..."
                    ) : (
                      "Créer mon compte vendeur"
                    )}
                  </Button>
                </div>

                {step === 1 && (
                  <p className="text-center text-sm text-muted-foreground">
                    Déjà vendeur ?{" "}
                    <Link href="/auth/login" className="text-primary underline underline-offset-4">
                      Se connecter
                    </Link>
                  </p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}