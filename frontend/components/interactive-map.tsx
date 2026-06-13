"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"

export function InteractiveMap() {
  const [regions, setRegions]     = useState<any[]>([])
  const [selected, setSelected]   = useState<any>(null)
  const [search, setSearch]       = useState("")

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/regions`)
      .then(r => r.json())
      .then(data => setRegions(data.data || []))
      .catch(() => setRegions([]))
  }, [])

  const filtered = regions.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        <Input
          placeholder="Rechercher une région..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {filtered.map(region => (
            <Card
              key={region.id}
              className={`cursor-pointer hover:bg-muted transition ${
                selected?.id === region.id ? 'border-primary' : ''
              }`}
              onClick={() => setSelected(region)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{region.name}</h3>
                    {region.name_ar && (
                      <p className="text-sm text-muted-foreground">{region.name_ar}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">
                      {region._count?.products || region.products?.length || 0} produits
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="lg:col-span-2">
        <Card className="h-full min-h-[500px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {selected ? selected.name : 'Carte de Tunisie 🇹🇳'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selected ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold text-lg mb-1">{selected.name}</h3>
                  {selected.name_ar && (
                    <p className="text-muted-foreground mb-2">{selected.name_ar}</p>
                  )}
                  {selected.latitude && (
                    <p className="text-sm text-muted-foreground">
                      📍 {selected.latitude.toFixed(4)}, {selected.longitude.toFixed(4)}
                    </p>
                  )}
                </div>
                {selected.products && selected.products.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Produits de cette région :</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {selected.products.map((p: any) => (
                        <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="font-medium">{p.name}</span>
                          <span className="text-primary font-bold">{p.price} DT</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <MapPin className="h-16 w-16 mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">
                  {filtered.length} régions tunisiennes
                </h3>
                <p className="text-muted-foreground text-sm max-w-md">
                  Sélectionnez une région pour voir ses produits locaux
                </p>
                <div className="grid grid-cols-3 gap-2 mt-6">
                  {filtered.slice(0, 6).map(r => (
                    <button
                      key={r.id}
                      onClick={() => setSelected(r)}
                      className="p-2 text-sm border rounded-lg hover:bg-muted transition text-center"
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}