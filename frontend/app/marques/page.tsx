import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { BrandCard } from "@/components/brand-card"
import type { Brand } from "@/lib/types"

export default async function MarquesPage() {
  const supabase = await createClient()

  const { data: brands } = await supabase.from("brands").select("*").order("name")

  return (
    <div className="min-h-screen flex flex-col">
      

      <main className="flex-1 pb-20 md:pb-8">
        <div className="container px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Marques Tunisiennes</h1>
            <p className="text-muted-foreground">Découvrez toutes les marques 100% tunisiennes</p>
          </div>

          {brands && brands.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {brands.map((brand: Brand) => (
                <BrandCard key={brand.id} brand={brand} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucune marque trouvée.</p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
