import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-server';
import { authCookieOptions } from '@/lib/auth-cookie';
import { getAppUrl } from '@/lib/url';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/c';
  const baseUrl = getAppUrl(request);
  const cleanNext = next.startsWith('/') ? next : `/${next}`;
  const redirectUrl = `${baseUrl}${cleanNext}`;

  const errorParam = searchParams.get('error');
  const errorCode = searchParams.get('error_code');
  const errorDesc = searchParams.get('error_description');

  if (errorParam || errorCode || errorDesc) {
    const errorQuery = new URLSearchParams();
    if (errorParam) errorQuery.set('error', errorParam);
    if (errorCode) errorQuery.set('error_code', errorCode);
    if (errorDesc) errorQuery.set('error_description', errorDesc);
    return NextResponse.redirect(`${baseUrl}/auth/login?${errorQuery.toString()}`);
  }

  if (code) {
    const cookieStore = await cookies();
    const response = NextResponse.redirect(redirectUrl);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookieOptions: authCookieOptions,
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                cookieStore.set({ name, value, ...options });
              } catch {
                // Ignore if called in context where cookieStore is sealed
              }
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.user) {
      // Ensure user profile exists in public.profiles table using admin client
      try {
        const { data: existingProfile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();

        if (!existingProfile) {
          const userName = data.user.user_metadata?.full_name || 
                           data.user.user_metadata?.name || 
                           data.user.email?.split('@')[0] || '';
          const userAvatar = data.user.user_metadata?.avatar_url || 
                             data.user.user_metadata?.picture || null;

          await supabaseAdmin.from('profiles').upsert({
            id: data.user.id,
            email: data.user.email,
            name: userName,
            avatar_url: userAvatar,
            plan: 'free',
            subscription_status: 'inactive',
          }, { onConflict: 'id' });
        }
      } catch (profileError) {
        console.error('Error creating user profile in callback:', profileError);
      }

      return response;
    }

    console.error('Auth callback exchange error:', error);
  }

  // If code exchange failed or no code present, redirect to login with error
  return NextResponse.redirect(`${baseUrl}/auth/login?error=Authentication%20failed`);
}
