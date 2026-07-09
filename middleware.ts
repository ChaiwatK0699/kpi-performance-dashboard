import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options });
        }
      }
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const publicPaths = ['/login', '/register', '/verify', '/pending-approval'];
  const isPublic = publicPaths.some((p) => path.startsWith(p));

  // ไม่ได้ login และพยายามเข้าหน้าที่ต้อง auth -> เด้งไป /login
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // login แล้ว แต่ status ยังไม่ active -> เช็คสถานะแล้วเด้งไปหน้าที่ถูกต้อง
  if (user && !isPublic) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('status, role')
      .eq('id', user.id)
      .single();

    if (profile?.status !== 'active') {
      const dest = profile?.status === 'pending_approval' ? '/pending-approval' : '/verify';
      return NextResponse.redirect(new URL(dest, request.url));
    }

    // ป้องกันหน้าหลังบ้าน: viewer ห้ามเข้า /backend หรือ /roster หรือ /users
    const restrictedForViewer = ['/backend', '/roster', '/users', '/audit-log'];
    if (profile.role === 'viewer' && restrictedForViewer.some((p) => path.startsWith(p))) {
      return NextResponse.redirect(new URL('/ranking', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
};
