"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Camera, Keyboard, CheckCircle, XCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import Link from "next/link"

type ScanMode = "camera" | "manual"

export function BarcodeScanner() {
  const [mode, setMode] = useState<ScanMode>("manual")
  const [barcode, setBarcode] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Camera scanner (for demonstration - in production, use a library like @zxing/library)
  const startCamera = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }

      setIsScanning(true)
    } catch (err) {
      setError("Impossible d'accéder à la caméra. Veuillez utiliser la saisie manuelle.")
      setMode("manual")
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
  }

  const searchProduct = async (code: string) => {
    if (!code) return

    setError(null)
    setResult(null)

    const supabase = createClient()

    try {
      const { data, error: searchError } = await supabase
        .from("products")
        .select("*, brands(*), categories(*)")
        .eq("barcode", code)
        .single()

      if (searchError || !data) {
        setResult({
          found: false,
          message: "Produit non trouvé dans notre base de données",
        })
      } else {
        setResult({
          found: true,
          product: data,
        })
      }
    } catch (err) {
      setError("Erreur lors de la recherche du produit")
    }
  }

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchProduct(barcode)
  }

  useEffect(() => {
    if (mode === "camera") {
      startCamera()
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [mode])

  return (
    <div className="max-w-2xl mx-auto">
      {/* Mode Selection */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={mode === "manual" ? "default" : "outline"}
          className="flex-1"
          onClick={() => setMode("manual")}
        >
          <Keyboard className="h-4 w-4 mr-2" />
          Saisie manuelle
        </Button>
        <Button
          variant={mode === "camera" ? "default" : "outline"}
          className="flex-1"
          onClick={() => setMode("camera")}
        >
          <Camera className="h-4 w-4 mr-2" />
          Scanner
        </Button>
      </div>

      {/* Scanner Area */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{mode === "camera" ? "Scanner le code-barres" : "Entrer le code-barres"}</CardTitle>
          <CardDescription>
            {mode === "camera"
              ? "Positionnez le code-barres devant la caméra"
              : "Saisissez manuellement le code-barres du produit"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === "camera" ? (
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-32 border-2 border-primary rounded-lg"></div>
              </div>
              {!isScanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <div className="text-center">
                    <Camera className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Chargement de la caméra...</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleManualSearch} className="space-y-4">
              <div>
                <Label htmlFor="barcode">Code-barres</Label>
                <Input
                  id="barcode"
                  type="text"
                  placeholder="Ex: 6191505100123"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="mt-2"
                />
              </div>
              <Button type="submit" className="w-full">
                Rechercher
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Example Barcodes */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Essayez ces codes-barres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {["6191505100123", "6191505200456", "6111234567890", "6111234500001"].map((code) => (
              <Button
                key={code}
                variant="outline"
                size="sm"
                onClick={() => {
                  setBarcode(code)
                  searchProduct(code)
                }}
              >
                {code}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Result */}
      {result && (
        <Card className="border-2">
          {result.found ? (
            <div>
              <CardHeader className="bg-green-50 dark:bg-green-950/20 border-b">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <CardTitle className="text-green-900 dark:text-green-100">Produit 100% Tunisien</CardTitle>
                    <CardDescription className="text-green-700 dark:text-green-300 mt-1">
                      Ce produit est fabriqué en Tunisie
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="relative w-24 h-24 flex-shrink-0 rounded-lg bg-muted overflow-hidden">
                    <Image
                      src={result.product.image_url || "/placeholder.svg?height=200&width=200"}
                      alt={result.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{result.product.name}</h3>
                    {result.product.brands && (
                      <p className="text-sm text-muted-foreground mb-2">{result.product.brands.name}</p>
                    )}
                    {result.product.price && (
                      <p className="text-xl font-bold text-primary mb-3">{result.product.price.toFixed(3)} TND</p>
                    )}
                    <Button asChild>
                      <Link href={`/produits/${result.product.id}`}>Voir le produit</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </div>
          ) : (
            <div>
              <CardHeader className="bg-orange-50 dark:bg-orange-950/20 border-b">
                <div className="flex items-start gap-3">
                  <XCircle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
                  <div>
                    <CardTitle className="text-orange-900 dark:text-orange-100">Produit non trouvé</CardTitle>
                    <CardDescription className="text-orange-700 dark:text-orange-300 mt-1">
                      {result.message}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Le code-barres <strong>{barcode}</strong> n'est pas dans notre base de données. Si vous pensez qu'il
                  s'agit d'un produit tunisien, vous pouvez nous le signaler.
                </p>
                <Button variant="outline">Signaler un produit manquant</Button>
              </CardContent>
            </div>
          )}
        </Card>
      )}

      {/* Info Card */}
      {!result && !error && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Comment ça marche ?</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">1.</span>
                <span>Choisissez entre scanner avec la caméra ou saisir manuellement</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">2.</span>
                <span>Scannez ou entrez le code-barres du produit</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">3.</span>
                <span>Découvrez instantanément si le produit est 100% tunisien</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
