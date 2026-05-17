import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                path: options.path ?? '/',
                sameSite: options.sameSite ?? 'lax',
                secure: options.secure ?? process.env.NODE_ENV === 'production',
              });
            });
          } catch (error) {
            console.error('Falha ao definir cookies (provavelmente Server Component):', error);
          }
        },
      },
    }
  );
}