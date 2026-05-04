import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import VisitCard from '@/components/VisitCard';
import type { Visit } from '@/types';
import { Calendar, Home } from 'lucide-react';

export default async function VisitsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: visits } = await supabase
    .from('visits')
    .select(`
      *,
      properties (
        title,
        location
      )
    `)
    .eq('tenant_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-[#f0f0f0]">
            Mes visites
          </h1>
          <p className="text-[#8b8fa8]">
            {visits?.length || 0} visite{visits?.length !== 1 ? 's' : ''} réservée{visits?.length !== 1 ? 's' : ''}
          </p>
        </div>

        {visits && visits.length > 0 ? (
          <div className="space-y-4">
            {visits.map((visit) => (
              <VisitCard key={visit.id} visit={visit as Visit} />
            ))}
          </div>
        ) : (
          <div className="bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-2xl p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-[#8b8fa8]" />
            <p className="text-[#8b8fa8] mb-6">
              Vous n'avez pas encore réservé de visite
            </p>
            <a
              href="/properties"
              className="inline-flex items-center gap-2 bg-[#c8a96e] text-[#08090a] font-semibold px-6 py-3 rounded-xl hover:bg-[#d4b87a] transition-all"
            >
              <Home className="w-5 h-5" />
              Parcourir les biens
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
