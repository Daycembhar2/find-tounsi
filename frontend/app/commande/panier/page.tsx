import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react"

export default function PanierPage() {
  // Données temporaires - à remplacer par votre état global
  const cartItems = [
    {
      id: "1",
      name: "Pack hydratation Zynia",
      price: 16,
      currency: "DT",
      image: "/images/zynia-pack.jpg",
      quantity: 2
    },
    {
      id: "2", 
      name: "Crème solaire Zynia",
      price: 35,
      currency: "DT",
      image: "/images/creme-solaire.jpg",
      quantity: 1
    }
  ]

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <ShoppingCart className="w-8 h-8" />
        Mon Panier
      </h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Votre panier est vide</h2>
          <p className="text-muted-foreground mb-6">
            Découvrez nos produits tunisiens et ajoutez-les à votre panier !
          </p>
          <Link href="/categories">
            <Button>Découvrir les produits</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des articles */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-green-600 font-bold">
                    {item.price} {item.currency}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                
                <Button variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Résumé de commande */}
          <div className="border rounded-lg p-6 h-fit">
            <h2 className="text-xl font-semibold mb-4">Résumé de commande</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span>{total} DT</span>
              </div>
              <div className="flex justify-between">
                <span>Livraison</span>
                <span className="text-green-600">Gratuite</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total</span>
                <span>{total} DT</span>
              </div>
            </div>

            <Button className="w-full mb-4" size="lg">
              Commander maintenant
            </Button>
            
            <Link href="/categories">
              <Button variant="outline" className="w-full">
                Continuer mes achats
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}