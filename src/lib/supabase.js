import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wljvzjtdlklrheayjrlv.supabase.co'
const supabaseAnonKey = 'sb_publishable_R3BpLwZJBXAoCdhs6YbmIQ_Un2_w8Wj'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
