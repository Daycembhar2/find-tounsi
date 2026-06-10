import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { BarcodeScanner } from "@/components/barcode-scanner"

export default function ScannerPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-20 md:pb-8">
        <div className="container px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Scanner de Code-barres</h1>
            <p className="text-muted-foreground">
              Scannez le code-barres d'un produit pour vérifier son origine tunisienne
            </p>
          </div>

          <BarcodeScanner />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
