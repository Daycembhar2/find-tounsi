export interface Category {
  id: string
  name: string
  name_ar: string
  slug: string
  description: string | null
  icon: string | null
  created_at: string
}

export interface Brand {
  id: string
  name: string
  name_ar: string | null
  slug: string
  logo_url: string | null
  description: string | null
  description_ar: string | null
  website: string | null
  founded?: number 
  is_verified: boolean
  created_at: string
}

export interface Product {
  id: string
  name: string
  name_ar: string | null
  description: string | null
  description_ar: string | null
  barcode: string | null
  qr_code: string | null
  category_id: string | null
  brand_id: string | null
  price: number | null
  image_url: string | null
  is_100_percent_tunisian: boolean
  created_at: string
  updated_at: string
  categories?: Category
  brands?: Brand
}

export interface Store {
  id: string
  name: string
  name_ar: string | null
  address: string
  address_ar: string | null
  city: string
  phone: string | null
  latitude: number
  longitude: number
  store_type: string | null
  opening_hours: any
  created_at: string
}

export interface Supplier {
  id: string
  name: string
  name_ar: string | null
  address: string | null
  address_ar: string | null
  city: string
  phone: string | null
  email: string | null
  website: string | null
  latitude: number | null
  longitude: number | null
  created_at: string
}

export interface UserProfile {
  id: string
  user_role: "consumer" | "seller" | "admin"
  full_name: string | null
  phone_number: string | null
  address: string | null
  city: string | null
  postal_code: string | null
  latitude: number | null
  longitude: number | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Seller {
  id: string
  business_name: string
  business_name_ar: string | null
  business_description: string | null
  business_logo_url: string | null
  tax_id: string | null
  bank_account: string | null
  bank_name: string | null
  address: string
  city: string
  phone: string
  email: string
  is_verified: boolean
  verification_date: string | null
  total_sales: number
  average_rating: number
  created_at: string
  updated_at: string
}

export interface OTPVerification {
  id: string
  email: string
  phone_number: string | null
  otp_code: string
  otp_type: "signup" | "password_reset" | "login_verification"
  is_verified: boolean
  expires_at: string
  attempts: number
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  seller_id: string
  order_number: string
  total_amount: number
  shipping_cost: number
  tax_amount: number
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "returned"
  payment_status: "unpaid" | "paid" | "refunded" | "failed"
  delivery_address: string
  delivery_city: string
  delivery_latitude: number | null
  delivery_longitude: number | null
  delivery_date: string | null
  expected_delivery_date: string | null
  actual_delivery_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
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

export interface Payment {
  id: string
  order_id: string
  user_id: string
  amount: number
  currency: string
  payment_method: "card" | "transfer" | "cash_on_delivery"
  payment_gateway: string | null
  transaction_id: string | null
  status: "pending" | "processing" | "completed" | "failed" | "cancelled"
  card_last_four: string | null
  card_brand: string | null
  created_at: string
  updated_at: string
}

export interface DeliveryTracking {
  id: string
  order_id: string
  current_location_latitude: number | null
  current_location_longitude: number | null
  current_city: string | null
  status: "pending_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed"
  estimated_delivery_time: string | null
  last_updated: string
  created_at: string
}

export interface ChatMessage {
  id: string
  user_id: string | null
  message_text: string
  message_type: "user" | "assistant"
  conversation_id: string | null
  created_at: string
}

export interface SellerRating {
  id: string
  seller_id: string
  user_id: string
  order_id: string | null
  rating: number
  comment: string | null
  created_at: string
}
