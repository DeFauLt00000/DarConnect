import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: visit } = await supabase
    .from('visits')
    .select('*, properties!inner(owner_id)')
    .eq('id', id)
    .single();

  if (!visit || visit.properties.owner_id !== user.id) {
    redirect('/sell/visits');
  }

  await supabase
    .from('visits')
    .update({ status: 'confirmed' })
    .eq('id', id);

  redirect('/sell/visits');
}
