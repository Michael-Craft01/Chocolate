import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Fetch session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  
  // Protect dashboard routes
  if (url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/billing') || url.pathname.startsWith('/campaigns') || url.pathname.startsWith('/settings')) {
    if (!user) {
      // Unauthenticated, push to landing page (or login when we have it)
      url.pathname = '/' 
      return NextResponse.redirect(url)
    }
  }

  // If already authenticated and hitting landing page, push to dashboard
  if (url.pathname === '/') {
    if (user) {
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - api routes (these go directly to the backend on port 3005)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, and common static file extensions
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
