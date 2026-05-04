import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  await supabase.from('profiles').update({ role: 'seller' }).eq('id', user.id);

  redirect('/sell');
}
