"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Camera, Keyboard, CheckCircle, XCircle, Loader2, RefreshCw, Lightbulb } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

type ScanMode = "camera" | "manual"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export function BarcodeScanner() {
  const [mode, setMode]             = useState<ScanMode>("manual")
  const [barcode, setBarcode]       = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [result, setResult]         = useState<any>(null)
  const [error, setError]           = useState<string | null>(null)
  const [torchOn, setTorchOn]       = useState(false)
  const [scanAttempts, setScanAttempts] = useState(0)

  const videoRef   = useRef<HTMLVideoElement>(null)
  const streamRef  = useRef<MediaStream | null>(null)
  const scannerRef = useRef<any>(null)
  const scannedRef = useRef(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // ─── Stopper la caméra ───────────────────────────────────
  const stopCamera = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (scannerRef.current) {
      try { scannerRef.current.reset() } catch {}
      scannerRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    scannedRef.current = false
    setIsScanning(false)
    setTorchOn(false)
    setScanAttempts(0)
  }, [])

  // ─── Recherche produit ───────────────────────────────────
  const searchProduct = useCallback(async (code: string) => {
    if (!code.trim()) return
    stopCamera()
    setMode("manual")
    setError(null)
    setResult(null)
    setIsSearching(true)

    try {
      const res = await fetch(`${API_URL}/api/scan/barcode/${code.trim()}`)
      if (!res.ok) throw new Error(`Erreur serveur ${res.status}`)
      const data = await res.json()

      if (data.product) {
        const isLocal = data.source === 'local'
        setResult({
          found: true,
          is_tunisian: data.is_tunisian ?? false,
          product: data.product,
          message: data.message || "Produit trouvé",
          isLocal,
        })
      } else {
        setResult({
          found:   false,
          message: data.message || "Produit non trouvé dans notre base",
        })
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la recherche")
    } finally {
      setIsSearching(false)
    }
  }, [stopCamera])

  // ─── Activer/Désactiver la torche ────────────────────────
  const toggleTorch = useCallback(async () => {
    if (!streamRef.current) return
    const track = streamRef.current.getVideoTracks()[0]
    if (!track) return

    try {
      const capabilities = track.getCapabilities() as any
      if (!capabilities.torch) {
        setError("La torche n'est pas disponible sur cet appareil")
        return
      }

      await track.applyConstraints({
        advanced: [{ torch: !torchOn }]
      } as any)
      setTorchOn(!torchOn)
    } catch (err) {
      console.error("Erreur torche:", err)
      setError("Impossible d'activer la torche")
    }
  }, [torchOn])

  // ─── Démarrer la caméra ──────────────────────────────────
  const startCamera = useCallback(async () => {
  setError(null);
  setResult(null);
  scannedRef.current = false;
  setScanAttempts(0);

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1920, min: 1280 },
        height: { ideal: 1080, min: 720 },
      },
    });

    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await new Promise<void>((resolve) => {
        if (videoRef.current) videoRef.current.onloadedmetadata = () => resolve();
      });
      await videoRef.current.play();
    }

    setIsScanning(true);

    const { BrowserMultiFormatReader } = await import("@zxing/browser");
    const { DecodeHintType, BarcodeFormat } = await import("@zxing/library");

    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.QR_CODE,
      BarcodeFormat.DATA_MATRIX,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.ITF,
      BarcodeFormat.CODABAR,
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);
    hints.set(DecodeHintType.CHARACTER_SET, "UTF-8");

    const reader = new BrowserMultiFormatReader(hints);
    scannerRef.current = reader;

    let attempts = 0;
    const maxAttempts = 300; // 60 sec (200ms * 300)

    intervalRef.current = setInterval(async () => {
      if (scannedRef.current || !videoRef.current || attempts >= maxAttempts) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (attempts >= maxAttempts && !scannedRef.current) {
          setError("Aucun code-barres détecté. Essayez la saisie manuelle.");
          stopCamera();
          setMode("manual");
        }
        return;
      }

      attempts++;
      setScanAttempts(attempts);

      try {
        // ✅ FIX: use decodeOnceFromVideoElement instead
        const result = await reader.decodeOnceFromVideoElement(videoRef.current);
        if (result && !scannedRef.current) {
          scannedRef.current = true;
          if (intervalRef.current) clearInterval(intervalRef.current);
          const code = result.getText();   // ✅ Now getText works
          console.log("✅ Code-barres détecté:", code);
          setBarcode(code);
          searchProduct(code);
        }
      } catch (err) {
        // No code found in this frame – ignore error
      }
    }, 200);
  } catch (err: any) {
    let msg = "Impossible d'accéder à la caméra. Utilisez la saisie manuelle.";
    if (err?.name === "NotAllowedError")
      msg = "Permission caméra refusée. Autorisez l'accès dans les paramètres du navigateur.";
    else if (err?.name === "NotFoundError")
      msg = "Aucune caméra détectée sur cet appareil.";
    else if (err?.name === "NotReadableError")
      msg = "La caméra est déjà utilisée par une autre application.";
    else if (err?.name === "OverconstrainedError")
      msg = "Caméra non compatible avec les contraintes demandées.";

    setError(msg);
    setMode("manual");
    stopCamera();
  }
}, [searchProduct, stopCamera]);

  // ─── Signaler produit manquant ───────────────────────────
  const reportMissingProduct = async () => {
    if (!barcode.trim()) { alert("Aucun code-barres à signaler"); return }
    try {
      const res = await fetch(`${API_URL}/api/missing-products`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ barcode: barcode.trim() }),
      })
      const data = await res.json()
      alert(res.ok ? "✅ Produit signalé avec succès. Merci !" : "❌ " + (data.message || "Erreur"))
    } catch {
      alert("❌ Impossible d'envoyer le signalement")
    }
  }

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchProduct(barcode)
  }

  const handleReset = () => {
    setResult(null)
    setError(null)
    setBarcode("")
    scannedRef.current = false
    setScanAttempts(0)
  }

  useEffect(() => {
    if (mode === "camera") startCamera()
    else stopCamera()
    return () => stopCamera()
  }, [mode]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* ─── Sélecteur mode ─── */}
      <div className="flex gap-2">
        <Button variant={mode === "manual" ? "default" : "outline"} className="flex-1"
          onClick={() => setMode("manual")}>
          <Keyboard className="h-4 w-4 mr-2" /> Saisie manuelle
        </Button>
        <Button variant={mode === "camera" ? "default" : "outline"} className="flex-1"
          onClick={() => setMode("camera")}>
          <Camera className="h-4 w-4 mr-2" /> Scanner caméra
        </Button>
      </div>

      {/* ─── Zone scan / formulaire ─── */}
      <Card>
        <CardHeader>
          <CardTitle>{mode === "camera" ? "Scanner le code-barres" : "Entrer le code-barres"}</CardTitle>
          <CardDescription>
            {mode === "camera"
              ? "Pointez la caméra vers le code-barres du produit"
              : "Tapez ou collez le code-barres ci-dessous"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === "camera" ? (
            <div className="space-y-3">
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                  style={{ transform: "scaleX(1)" }} // Mirror désactivé pour codes-barres
                />

                {/* Bouton torche */}
                <button 
                  onClick={toggleTorch}
                  className={`absolute top-3 right-3 z-20 p-2 rounded-full transition-colors ${
                    torchOn ? "bg-yellow-500 text-black" : "bg-black/60 text-white hover:bg-black/80"
                  }`}
                  title={torchOn ? "Désactiver la torche" : "Activer la torche"}
                >
                  <Lightbulb className="h-4 w-4" />
                </button>

                {/* Overlay de scan */}
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative w-72 h-48">
                      {/* Coins du cadre */}
                      {[
                        "top-0 left-0 border-t-4 border-l-4 rounded-tl-lg",
                        "top-0 right-0 border-t-4 border-r-4 rounded-tr-lg",
                        "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-lg",
                        "bottom-0 right-0 border-b-4 border-r-4 rounded-br-lg",
                      ].map((cls, i) => (
                        <div key={i} className={`absolute w-10 h-10 border-primary ${cls}`} />
                      ))}
                      {/* Ligne de scan animée */}
                      <div className="absolute left-2 right-2 h-0.5 bg-primary animate-pulse top-1/2" />

                      {/* Texte d'aide */}
                      <div className="absolute -bottom-8 left-0 right-0 text-center">
                        <p className="text-xs text-white/80 bg-black/50 rounded px-2 py-1 inline-block">
                          Tentatives: {scanAttempts}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!isScanning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white gap-2">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p className="text-sm">Initialisation de la caméra...</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs text-center text-muted-foreground">
                  Gardez le code-barres bien éclairé et dans le cadre
                </p>
                <p className="text-xs text-center text-muted-foreground">
                  Conseil : Approchez lentement le code-barres et maintenez-le stable
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleManualSearch} className="space-y-4">
              <div className="grid gap-1.5">
                <Label htmlFor="barcode">Code-barres</Label>
                <Input id="barcode" type="text" inputMode="numeric"
                  placeholder="Ex: 6191234567890"
                  value={barcode} onChange={(e) => setBarcode(e.target.value)} autoFocus />
              </div>
              <Button type="submit" className="w-full" disabled={!barcode.trim() || isSearching}>
                {isSearching
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Recherche...</>
                  : "Rechercher le produit"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* ─── Codes de test ─── */}
      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Codes de test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {["6191234567890", "6194003550014", "6192000123456"].map((code) => (
              <Button key={code} variant="outline" size="sm" className="font-mono text-xs"
                onClick={() => { setBarcode(code); searchProduct(code) }}>
                {code}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── Erreur ─── */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ─── Résultat ─── */}
      {result && (
        <Card className="border-2">
          {result.found ? (
            <>
              <CardHeader className="bg-green-50 border-b">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <CardTitle className="text-green-900">
                      {result.is_tunisian ? "🇹🇳 Produit Tunisien Vérifié" : "Produit Importé"}
                    </CardTitle>
                    <CardDescription className="text-green-700 mt-1">{result.message}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <div className="flex gap-4">
                  <div className="relative w-24 h-24 flex-shrink-0 rounded-xl bg-muted overflow-hidden border">
                    <Image src={result.product.image_url || "/placeholder.svg"}
                      alt={result.product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg mb-1 truncate">{result.product.name}</h3>
                    <div className="space-y-0.5 text-sm text-muted-foreground">
                      {result.product.category?.name && (
                        <p>Catégorie : <span className="text-foreground">{result.product.category.name}</span></p>
                      )}
                      {result.product.region?.name && (
                        <p>Région : <span className="text-foreground">{result.product.region.name}</span></p>
                      )}
                      {result.product.brand?.name && (
                        <p>Marque : <span className="text-foreground">{result.product.brand.name}</span></p>
                      )}
                    </div>
                    {result.product.price && (
                      <p className="text-xl font-bold text-primary mt-2">
                        {Number(result.product.price).toFixed(3)} TND
                      </p>
                    )}
                    <div className="flex gap-2 mt-3">
                      {result.isLocal && result.product.id ? (
                        <Button asChild size="sm">
                          <Link href={`/produits/${result.product.id}`}>Voir le produit</Link>
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={reportMissingProduct}>
                          Signaler ce produit
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={handleReset}>
                        <RefreshCw className="w-3.5 h-3.5 mr-1" /> Nouveau scan
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="bg-orange-50 border-b">
                <div className="flex items-start gap-3">
                  <XCircle className="h-6 w-6 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <CardTitle className="text-orange-900">Produit non trouvé</CardTitle>
                    <CardDescription className="text-orange-700 mt-1">{result.message}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Le code <strong className="font-mono">{barcode}</strong> n'est pas dans notre base.
                </p>
                <div className="flex gap-2">
                  <Button onClick={reportMissingProduct} variant="outline" className="flex-1">
                    Signaler ce produit manquant
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      )}

    </div>
  )
}