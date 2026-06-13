// ============================================================
// FIND TOUNSI — Types centralisés
// ============================================================

// ─── Catégorie ───────────────────────────────────────────────
export interface Category {
  id: string
  name: string
  name_ar?: string
  slug: string
  description?: string | null
  icon?: string | null
  image_url?: string | null
  product_count?: number
  created_at: string
}

// ─── Marque / Fabricant ──────────────────────────────────────
export interface Brand {
  id: string
  name: string
  name_ar?: string | null
  slug: string
  logo_url?: string | null
  description?: string | null
  description_ar?: string | null
  website?: string | null
  founded?: number
  region?: string | null
  is_verified: boolean
  created_at: string
}

// ─── Région / Gouvernorat ────────────────────────────────────
export interface Region {
  id: string
  name: string
  name_ar?: string | null
  slug: string
  latitude?: number | null
  longitude?: number | null
}

// ─── Produit ─────────────────────────────────────────────────
export interface Product {
  id: string
  name: string
  name_ar?: string | null
  slug?: string
  description?: string | null
  description_ar?: string | null
  barcode?: string | null
  qr_code?: string | null
  price?: number | null
  currency?: string
  image_url?: string | null
  images?: string[]
  stock?: number | null
  is_100_percent_tunisian: boolean
  is_verified?: boolean
  is_available?: boolean
  category_id?: string | null
  brand_id?: string | null
  seller_id?: string | null
  region_id?: string | null
  category_slug?: string
  category?: Category | null
  brand?: Brand | null
  region?: Region | null
  seller?: Seller | null
  average_rating?: number
  review_count?: number
  created_at: string
  updated_at?: string
}

// ─── Vendeur (Seller) ────────────────────────────────────────
export interface Seller {
  id: string
  user_id?: string
  name?: string
  business_name?: string
  business_name_ar?: string | null
  business_description?: string | null
  business_logo_url?: string | null
  tax_id?: string | null
  bank_account?: string | null
  bank_name?: string | null
  address: string
  city: string
  region?: string | null
  phone: string
  email: string
  is_verified: boolean
  verification_date?: string | null
  total_sales?: number
  average_rating?: number
  created_at: string
  updated_at?: string
}

// ─── Profil Utilisateur ──────────────────────────────────────
export interface UserProfile {
  id: string
  email?: string
  name?: string
  full_name?: string | null
  phone_number?: string | null
  address?: string | null
  city?: string | null
  postal_code?: string | null
  avatar_url?: string | null
  user_role: "consumer" | "seller" | "admin"
  latitude?: number | null
  longitude?: number | null
  created_at: string
  updated_at?: string
}

// ─── Favoris ─────────────────────────────────────────────────
export interface Favorite {
  id: string
  user_id: string
  product_id: string
  product?: Product
  created_at: string
}

// ─── Panier ──────────────────────────────────────────────────
export interface CartItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  seller_id: string
  seller_name?: string
  image_url?: string | null
  currency?: string
}

// ─── Commande ────────────────────────────────────────────────
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned"

export type PaymentStatus = "unpaid" | "paid" | "refunded" | "failed"

export interface Order {
  id: string
  user_id: string
  seller_id: string
  order_number: string
  total_amount: number
  shipping_cost: number
  tax_amount: number
  status: OrderStatus
  payment_status: PaymentStatus
  delivery_address: string
  delivery_city: string
  delivery_latitude?: number | null
  delivery_longitude?: number | null
  delivery_date?: string | null
  expected_delivery_date?: string | null
  actual_delivery_date?: string | null
  notes?: string | null
  created_at: string
  updated_at?: string
  order_items?: OrderItem[]
  seller?: Seller
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
  product?: Product
}

// ─── Paiement ────────────────────────────────────────────────
export type PaymentMethod = "card" | "transfer" | "cash_on_delivery"

export interface Payment {
  id: string
  order_id: string
  user_id: string
  amount: number
  currency: string
  payment_method: PaymentMethod
  payment_gateway?: string | null
  transaction_id?: string | null
  status: "pending" | "processing" | "completed" | "failed" | "cancelled"
  card_last_four?: string | null
  card_brand?: string | null
  created_at: string
  updated_at?: string
}

// ─── Suivi de Livraison ──────────────────────────────────────
export type DeliveryStatus =
  | "pending_pickup"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "failed"

export interface DeliveryTracking {
  id: string
  order_id: string
  current_location_latitude?: number | null
  current_location_longitude?: number | null
  current_city?: string | null
  status: DeliveryStatus
  estimated_delivery_time?: string | null
  last_updated: string
  created_at: string
}

// ─── Avis / Notation ─────────────────────────────────────────
export interface ProductReview {
  id: string
  product_id: string
  user_id: string
  user_name?: string
  rating: number           // 1–5
  comment?: string | null
  created_at: string
}

export interface SellerRating {
  id: string
  seller_id: string
  user_id: string
  order_id?: string | null
  rating: number
  comment?: string | null
  created_at: string
}

// ─── Chatbot ─────────────────────────────────────────────────
export interface ChatMessage {
  id: string
  user_id?: string | null
  message_text: string
  message_type: "user" | "assistant"
  conversation_id?: string | null
  created_at: string
}

// ─── Scanner / Signalement ───────────────────────────────────
export interface ScanResult {
  found: boolean
  product?: Product
  barcode: string
  scanned_at: string
}

export interface MissingProductReport {
  id: string
  user_id?: string | null
  barcode?: string | null
  product_name?: string | null
  description?: string | null
  image_url?: string | null
  status: "pending" | "reviewed" | "added" | "rejected"
  created_at: string
}

// ─── Magasin / Point de vente ────────────────────────────────
export interface Store {
  id: string
  name: string
  name_ar?: string | null
  address: string
  address_ar?: string | null
  city: string
  phone?: string | null
  latitude: number
  longitude: number
  store_type?: string | null
  opening_hours?: any
  created_at: string
}

// ─── OTP / Authentification ──────────────────────────────────
export interface OTPVerification {
  id: string
  email: string
  phone_number?: string | null
  otp_code: string
  otp_type: "signup" | "password_reset" | "login_verification"
  is_verified: boolean
  expires_at: string
  attempts: number
  created_at: string
}

// ─── Réponses API génériques ─────────────────────────────────
export interface ApiResponse<T> {
  data: T
  message?: string
  success?: boolean
  total?: number
  page?: number
  limit?: number
}

export interface ApiError {
  message: string
  status?: number
  code?: string
}

// ─── Filtres produits ────────────────────────────────────────
export interface ProductFilters {
  category_slug?: string
  brand_id?: string
  region_id?: string
  min_price?: number
  max_price?: number
  is_100_percent_tunisian?: boolean
  is_verified?: boolean
  search?: string
  sort?: "price_asc" | "price_desc" | "newest" | "rating"
  page?: number
  limit?: number
}