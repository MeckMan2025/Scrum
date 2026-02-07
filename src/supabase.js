import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wqxjmykphkacbjfxmvzd.supabase.co'
const supabaseKey = 'sb_publishable_xNeNPW-TJoZ0iXMjKzO78Q_T2YoxkyA'

export const supabase = createClient(supabaseUrl, supabaseKey)
