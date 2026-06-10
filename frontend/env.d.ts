/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
  // Ajoute d'autres variables VITE_ ici si besoin
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
