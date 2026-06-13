import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-8 pb-8">
          <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-600" />
          <h1 className="text-2xl font-bold mb-2">Commande confirmée</h1>
          <p className="text-muted-foreground mb-6">
            Votre commande a été envoyée au vendeur.
          </p>
          <Button asChild>
            <Link href="/produits">Retour aux produits</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}