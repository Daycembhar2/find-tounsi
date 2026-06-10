import type React from "react"
import type { Metadata, Viewport } from "next"
import { Poppins, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import AIChatbot from "@/components/ChatBot"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
})
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FindTounsi - Plateforme de Commerce Hybride Tunisienne",
  description: "Découvrez et soutenez les produits tunisiens.",
}

export const viewport: Viewport = {
  themeColor: "#E53935",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans antialiased bg-background`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
        >
          {/* ✅ Header affiché partout */}
          <Header />

          {/* ✅ Contenu de chaque page */}
          <main className="flex-1">{children}</main>

          {/* ✅ BottomNav affiché partout */}
          <BottomNav />

          {/* ✅ Chatbot et Analytics */}
          <AIChatbot />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
