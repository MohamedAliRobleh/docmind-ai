import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createServerSupabase() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

export async function getUser() {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserNiche(): Promise<string | null> {
  const user = await getUser()
  if (!user) return null
  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('profiles')
    .select('niche')
    .eq('id', user.id)
    .single()
  return data?.niche ?? null
}
