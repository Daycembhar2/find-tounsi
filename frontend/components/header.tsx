"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart, User, Menu } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTheme } from "next-themes"

export default function Header() {
  const { user, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // ⚡ Gestion thème
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // ✅ Liste des catégories
  const categories = [
    { name: "Cosmétiques", href: "/categories/cosmetiques" },
    { name: "Vêtements", href: "/categories/vetements" },
    { name: "Artisanat", href: "/categories/artisanat" },
    { name: "Alimentation", href: "/categories/alimentation" },
    { name: "Électronique", href: "/categories/electronique" },       // ✅ ajouté
  { name: "Bijoux Tunisiennes", href: "/categories/bijoux-tunisiennes" },
  ]

  const NavLinks = () => (
    <>
      <Link href="/" className="hover:text-primary transition-colors">
        Accueil
      </Link>

      {/* Dropdown catégories */}
      <div className="relative group">
        <Link href="/#categories" className="hover:text-primary transition-colors">
  Catégories
</Link>
        <div className="absolute left-0 top-full mt-2 w-48 bg-background border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 dark:border-gray-700 dark:bg-gray-800">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      <Link href="/#about" className="hover:text-primary transition-colors">
        A propos
      </Link>
    </>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-red-600 flex items-center justify-center">
            <img src="/Tunisie.jpg" alt="Drapeau Tunisien" className="w-full h-full object-cover" />
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-foreground">FindTounsi</h1>
            <p className="text-xs text-accent font-medium">100% Tunisien</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLinks />
        </nav>

        <div className="flex items-center gap-4">
          {/* Bouton Thème */}
          {mounted && (
            <Button
              onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
              variant="ghost"
              size="icon"
              title="Changer le thème"
            >
              {resolvedTheme === "light" ? "🌙" : "☀️"}
            </Button>
          )}

          {user && (
            <>
              <Link href="/favoris">
                <Button variant="ghost" size="icon">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/cart">
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="h-5 w-5" />
                </Button>
              </Link>
            </>
          )}

          {user ? (
            <>
              <Link href="/profil" className="hidden md:block">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button onClick={signOut} variant="outline" className="hidden md:flex">
                Déconnexion
              </Button>
            </>
          ) : (
            <Link href="/auth/login" className="hidden md:block">
              <Button>Se connecter</Button>
            </Link>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-4 mt-8">
                {/* Mobile Nav */}
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Accueil
                  </Button>
                </Link>

                {/* Catégories Mobile */}
                <Link href="/#categories" onClick={() => setMobileMenuOpen(false)}>
  <Button variant="ghost" className="w-full justify-start">
    Catégories
  </Button>
</Link>

                
                <div className="flex flex-col ml-4 gap-2">
  {categories.map((cat) => (
    <Link
      key={cat.name}
      href={cat.href}
      onClick={() => setMobileMenuOpen(false)}
      className="block px-2 py-1"
    >
      {cat.name}
    </Link>
  ))}
</div>


                <Link href="/#about" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    A propos
                  </Button>
                </Link>

                {user ? (
                  <>
                    <Link href="/profil" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <User className="h-5 w-5 mr-2" />
                        Tableau de bord
                      </Button>
                    </Link>
                    <Button
                      onClick={() => {
                        signOut()
                        setMobileMenuOpen(false)
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Déconnexion
                    </Button>
                  </>
                ) : (
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">Se connecter</Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
