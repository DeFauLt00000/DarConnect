import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  if (params.error) {
    redirect('/auth/login?error=' + encodeURIComponent(params.error));
  }

  if (params.code) {
    await supabase.auth.exchangeCodeForSession(params.code);
    redirect('/profile');
  }

  redirect('/auth/login');
}
