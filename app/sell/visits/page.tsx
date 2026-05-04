import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import StatusBadge from '@/components/StatusBadge';
import { Calendar, MapPin, Phone, User, FileText, CheckCircle, XCircle, Home } from 'lucide-react';

export default async function SellerVisitsPage() {
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
        location,
        price_per_month
      ),
      profiles (
        full_name,
        phone,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false });

  const sellerVisits = visits?.filter(
    (visit) => visit.properties?.owner_id === user.id
  ) || [];

  const pendingCount = sellerVisits.filter((v) => v.status === 'pending').length;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-[#f0f0f0]">
            Demandes de visite
          </h1>
          <p className="text-[#8b8fa8]">
            {sellerVisits.length} demande{sellerVisits.length !== 1 ? 's' : ''} de visite
            {pendingCount > 0 && (
              <span className="ml-2 text-[#f59e0b]">
                ({pendingCount} en attente)
              </span>
            )}
          </p>
        </div>

        {sellerVisits.length > 0 ? (
          <div className="space-y-6">
            {sellerVisits.map((visit) => (
              <div
                key={visit.id}
                className="bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 hover:border-[rgba(200,169,110,0.3)] transition-all"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-[#f0f0f0] mb-2">
                          {visit.properties?.title}
                        </h3>
                        <div className="flex items-center gap-2 text-[#8b8fa8] mb-2">
                          <MapPin className="w-4 h-4 text-[#c8a96e]" />
                          <span className="text-sm">{visit.properties?.location}</span>
                        </div>
                        <p className="text-[#c8a96e] font-semibold text-sm">
                          {visit.properties?.price_per_month?.toLocaleString('fr-FR')} DZD/mois
                        </p>
                      </div>
                      <StatusBadge status={visit.status as any} />
                    </div>

                    <div className="border-t border-[rgba(255,255,255,0.08)] pt-4 mt-4">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 rounded-full bg-[#c8a96e] flex items-center justify-center text-[#08090a] font-bold text-sm">
                          {visit.profiles?.full_name
                            ?.split(' ')
                            .map((n: string) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-[#f0f0f0] font-medium">
                            {visit.profiles?.full_name}
                          </p>
                          {visit.profiles?.phone && (
                            <div className="flex items-center gap-2 text-[#8b8fa8] text-sm">
                              <Phone className="w-4 h-4" />
                              <span>{visit.profiles.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[#8b8fa8] text-sm mb-3">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Date de visite:{' '}
                          {new Date(visit.visit_date).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      {visit.id_scan_url && (
                        <a
                          href={visit.id_scan_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[#c8a96e] hover:text-[#d4b87a] transition-colors text-sm"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Voir la pièce d'identité</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {visit.status === 'pending' && (
                    <div className="flex flex-col gap-3 lg:w-48">
                      <form action={`/api/visits/${visit.id}/confirm`} method="POST">
                        <button
                          type="submit"
                          className="w-full bg-[#22c55e] text-white font-semibold py-2 rounded-xl hover:bg-[#2ecc71] transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Confirmer
                        </button>
                      </form>
                      <form action={`/api/visits/${visit.id}/cancel`} method="POST">
                        <button
                          type="submit"
                          className="w-full border border-[rgba(239,68,68,0.3)] text-[#ef4444] font-semibold py-2 rounded-xl hover:bg-[rgba(239,68,68,0.1)] transition-all flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Annuler
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-2xl p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-[#8b8fa8]" />
            <p className="text-[#8b8fa8] mb-6">
              Vous n'avez pas encore reçu de demandes de visite
            </p>
            <a
              href="/sell"
              className="inline-flex items-center gap-2 bg-[#c8a96e] text-[#08090a] font-semibold px-6 py-3 rounded-xl hover:bg-[#d4b87a] transition-all"
            >
              <Home className="w-5 h-5" />
              Voir mes annonces
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
