"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Phone, Navigation } from "lucide-react"
import type { Store } from "@/lib/types"

interface InteractiveMapProps {
  stores: Store[]
}

export function InteractiveMap({ stores }: InteractiveMapProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState<string>("all")
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)

  // Get unique cities
  const cities = useMemo(() => {
    const citySet = new Set(stores.map((s) => s.city))
    return Array.from(citySet).sort()
  }, [stores])

  // Filter stores
  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const matchesSearch =
        searchQuery === "" ||
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.address.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCity = selectedCity === "all" || store.city === selectedCity

      return matchesSearch && matchesCity
    })
  }, [stores, searchQuery, selectedCity])

  // Calculate center of Tunisia for map display
  const tunisiaCenter = { lat: 36.8065, lng: 10.1815 } // Tunis center

  const openInMaps = (store: Store) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`
    window.open(url, "_blank")
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Sidebar - Store List */}
      <div className="lg:col-span-1 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un magasin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* City Filter */}
        <Select value={selectedCity} onValueChange={setSelectedCity}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrer par ville" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les villes</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Store List */}
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {filteredStores.length > 0 ? (
            filteredStores.map((store) => (
              <Card
                key={store.id}
                className={`cursor-pointer transition-colors hover:bg-muted ${
                  selectedStore?.id === store.id ? "border-primary" : ""
                }`}
                onClick={() => setSelectedStore(store)}
              >
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-1">{store.name}</h3>
                  {store.store_type && (
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {store.store_type}
                    </Badge>
                  )}
                  <p className="text-sm text-muted-foreground mb-1">{store.address}</p>
                  <p className="text-sm text-muted-foreground">{store.city}</p>
                  {store.phone && (
                    <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{store.phone}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Aucun magasin trouvé</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stats */}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{filteredStores.length}</span> magasin(s) trouvé(s)
              {selectedCity !== "all" && ` à ${selectedCity}`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Map Area */}
      <div className="lg:col-span-2">
        <Card className="h-full min-h-[600px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Carte de Tunisie
            </CardTitle>
            <CardDescription>
              {selectedStore
                ? `Magasin sélectionné: ${selectedStore.name}`
                : "Sélectionnez un magasin pour voir plus de détails"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Map Placeholder - In production, use Leaflet or Google Maps */}
            <div className="relative w-full h-[500px] bg-muted rounded-lg overflow-hidden">
              {/* Tunisia Map SVG Representation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-16 w-16 mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">Carte Interactive</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Cette carte affichera tous les points de vente de produits tunisiens. Intégrez Leaflet.js ou Google
                    Maps pour une carte interactive complète.
                  </p>

                  {/* Markers representation */}
                  <div className="mt-6 grid grid-cols-2 gap-4 max-w-sm mx-auto">
                    {filteredStores.slice(0, 4).map((store, index) => (
                      <div
                        key={store.id}
                        className="flex items-center gap-2 p-2 bg-background rounded border text-left"
                      >
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{store.name}</p>
                          <p className="text-xs text-muted-foreground">{store.city}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selected Store Details Overlay */}
              {selectedStore && (
                <div className="absolute bottom-4 left-4 right-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{selectedStore.name}</CardTitle>
                      <CardDescription>
                        {selectedStore.address}, {selectedStore.city}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => openInMaps(selectedStore)}>
                          <Navigation className="h-4 w-4 mr-1" />
                          Itinéraire
                        </Button>
                        {selectedStore.phone && (
                          <Button size="sm" variant="outline" onClick={() => window.open(`tel:${selectedStore.phone}`)}>
                            <Phone className="h-4 w-4 mr-1" />
                            Appeler
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Map Instructions */}
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2 text-sm">Pour une carte interactive complète:</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Installez react-leaflet: npm install react-leaflet leaflet</li>
                <li>Configurez les marqueurs avec les coordonnées GPS des magasins</li>
                <li>Ajoutez la géolocalisation de l'utilisateur</li>
                <li>Implémentez le calcul d'itinéraire vers les magasins</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
