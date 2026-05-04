import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import VisitCard from '@/components/VisitCard';
import type { Visit } from '@/types';
import { Home, Calendar, User, LayoutDashboard, ArrowRight, CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

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
    .order('created_at', { ascending: false })
    .limit(3);

  const { data: allVisits } = await supabase
    .from('visits')
    .select('status')
    .eq('tenant_id', user.id);

  const visitStats = {
    total: allVisits?.length || 0,
    pending: allVisits?.filter((v) => v.status === 'pending').length || 0,
    confirmed: allVisits?.filter((v) => v.status === 'confirmed').length || 0,
    cancelled: allVisits?.filter((v) => v.status === 'cancelled').length || 0,
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const firstName = profile?.full_name?.split(' ')[0] || user.email?.split('@')[0] || '';

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-[#f0f0f0]">
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-[#8b8fa8]">
            Bienvenue sur votre tableau de bord
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 hover:border-[rgba(200,169,110,0.3)] transition-all">
            <div className="flex items-center justify-between mb-4">
              <LayoutDashboard className="w-8 h-8 text-[#c8a96e]" />
              <span className="text-3xl font-bold text-[#c8a96e]">
                {visitStats.total}
              </span>
            </div>
            <p className="text-[#8b8fa8]">Total visites</p>
          </div>

          <div className="bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 hover:border-[rgba(245,158,11,0.3)] transition-all">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-[#f59e0b]" />
              <span className="text-3xl font-bold text-[#f59e0b]">
                {visitStats.pending}
              </span>
            </div>
            <p className="text-[#8b8fa8]">Visites en attente</p>
          </div>

          <div className="bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 hover:border-[rgba(34,197,94,0.3)] transition-all">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-8 h-8 text-[#22c55e]" />
              <span className="text-3xl font-bold text-[#22c55e]">
                {visitStats.confirmed}
              </span>
            </div>
            <p className="text-[#8b8fa8]">Visites confirmées</p>
          </div>

          <div className="bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 hover:border-[rgba(239,68,68,0.3)] transition-all">
            <div className="flex items-center justify-between mb-4">
              <XCircle className="w-8 h-8 text-[#ef4444]" />
              <span className="text-3xl font-bold text-[#ef4444]">
                {visitStats.cancelled}
              </span>
            </div>
            <p className="text-[#8b8fa8]">Visites annulées</p>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-[#f0f0f0]">
            Visites récentes
          </h2>

          {visits && visits.length > 0 ? (
            <div className="space-y-4">
              {visits.map((visit) => (
                <VisitCard key={visit.id} visit={visit as Visit} />
              ))}
            </div>
          ) : (
            <div className="bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-2xl p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-[#8b8fa8]" />
              <p className="text-[#8b8fa8] mb-4">
                Vous n'avez pas encore réservé de visite
              </p>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6 text-[#f0f0f0]">
            Actions rapides
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <a
              href="/properties"
              className="bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 hover:border-[rgba(200,169,110,0.3)] transition-all group"
            >
              <Home className="w-8 h-8 text-[#c8a96e] mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold mb-2 text-[#f0f0f0]">
                Parcourir les biens
              </h3>
              <p className="text-[#8b8fa8] text-sm">
                Découvrez toutes les annonces disponibles
              </p>
            </a>

            <a
              href="/visits"
              className="bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 hover:border-[rgba(200,169,110,0.3)] transition-all group"
            >
              <Calendar className="w-8 h-8 text-[#c8a96e] mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold mb-2 text-[#f0f0f0]">
                Mes visites
              </h3>
              <p className="text-[#8b8fa8] text-sm">
                Gérez vos réservations de visite
              </p>
            </a>

            <a
              href="/profile"
              className="bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 hover:border-[rgba(200,169,110,0.3)] transition-all group"
            >
              <User className="w-8 h-8 text-[#c8a96e] mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold mb-2 text-[#f0f0f0]">
                Mon profil
              </h3>
              <p className="text-[#8b8fa8] text-sm">
                Mettez à jour vos informations
              </p>
            </a>

            <a
              href="/sell"
              className="bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 hover:border-[rgba(200,169,110,0.3)] transition-all group"
            >
              <TrendingUp className="w-8 h-8 text-[#c8a96e] mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold mb-2 text-[#f0f0f0]">
                Vendre un bien
              </h3>
              <p className="text-[#8b8fa8] text-sm">
                Publiez votre annonce gratuitement
              </p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
