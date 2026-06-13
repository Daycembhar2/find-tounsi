import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Wrench } from "lucide-react"

export default function PaymentPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-8 pb-8">
          <Wrench className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-2xl font-bold mb-2">Bientôt disponible</h1>
          <p className="text-muted-foreground mb-6">
            Le module de paiement est en cours de développement.
          </p>
          <Link href="/produits">
            <Button>Retour aux produits</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}