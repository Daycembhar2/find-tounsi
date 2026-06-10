import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log("[v0] Client - Checking Supabase env vars:")
  console.log("[v0] NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✓ Set" : "✗ Missing")
  console.log("[v0] NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "✓ Set" : "✗ Missing")

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[v0] Supabase env vars missing on client!")
    throw new Error(
      `Supabase is not configured on client. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your Vercel project settings under "Vars" section.`,
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
