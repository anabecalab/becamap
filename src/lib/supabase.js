import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wljvzjtdlklrheayjrlv.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_R3BpLwZJBXAoCdhs6YbmIQ_Un2_w8Wj'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
