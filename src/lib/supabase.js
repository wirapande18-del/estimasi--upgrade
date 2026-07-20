import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Supabase bersifat opsional. Jika .env belum diisi, aplikasi tetap berjalan
// menggunakan database lokal browser (localStorage), bukan menjadi blank.
const fallbackUrl = 'https://local-placeholder.supabase.co'
const fallbackKey = 'local-placeholder-anon-key'

export const supabase = createClient(
  supabaseUrl || fallbackUrl,
  supabaseAnonKey || fallbackKey,
  {
    auth: {
      persistSession: isSupabaseConfigured,
      autoRefreshToken: isSupabaseConfigured,
      detectSessionInUrl: isSupabaseConfigured,
    },
  },
)
