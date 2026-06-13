import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const protectedRoutes = ['/profil', '/favoris', '/cart', '/commande', '/mes-commandes', '/vendeur/dashboard', '/vendeur/produits', '/vendeur/commandes']
  const { pathname } = request.nextUrl

  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtected) {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}