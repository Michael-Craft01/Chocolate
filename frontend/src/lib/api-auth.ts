import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function getAuthUser(req: NextRequest) {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  let user = null;
  
  // Try cookie-based auth first
  const { data: { user: cookieUser } } = await supabase.auth.getUser();
  user = cookieUser;

  // Fallback to token query param or Authorization header
  if (!user) {
    const authHeader = req.headers.get('Authorization');
    const tokenParam = req.nextUrl.searchParams.get('token');
    const token = tokenParam || authHeader?.replace('Bearer ', '');
    
    if (token) {
      const { data: { user: tokenUser } } = await supabase.auth.getUser(token);
      user = tokenUser;
    }
  }

  return user;
}

export function authError() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
