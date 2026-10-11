// src/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Atualiza a sessão (importante para SSR + cookies)
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Rotas protegidas — redireciona para /login se não autenticado
  const protectedPaths = [
    '/hub',
    '/setup',
    '/escrita',
    '/orcamento',
    '/projeto',
    '/auditoria',
    '/configuracoes',
    '/portfolio',
  ];

  const isProtected = protectedPaths.some((path) =>
    pathname === path || pathname.startsWith(path + '/')
  );

  if (!user && isProtected) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Se já está logado e tenta acessar /login, manda pro hub
  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/hub', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Ignora arquivos estáticos, imagens e rotas internas do Next.js.
     * Roda o middleware em todas as outras rotas.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
