import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import { Plus, Home, TrendingUp, Shield, Zap, CheckCircle, ArrowRight } from 'lucide-react';

export default async function SellPage() {
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

  if (!profile || profile.role !== 'seller') {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#c8a96e] to-[#d4b87a] rounded-2xl p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1">
                <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-[#08090a]">
                  Devenez vendeur
                </h1>
                <p className="text-[#08090a] opacity-80 mb-6">
                  Publiez vos annonces gratuitement et atteignez des milliers de locataires potentiels
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-[#08090a]" />
                    <span className="text-[#08090a] text-sm">Annonces vérifiées</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-[#08090a]" />
                    <span className="text-[#08090a] text-sm">Publication rapide</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#08090a]" />
                    <span className="text-[#08090a] text-sm">100% gratuit</span>
                  </div>
                </div>

                <form action="/api/become-seller" method="POST">
                  <button
                    type="submit"
                    className="bg-[#08090a] text-[#c8a96e] font-semibold px-8 py-3 rounded-xl hover:bg-[#1a1d24] transition-all flex items-center gap-2"
                  >
                    Devenir vendeur
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </form>
              </div>

              <div className="flex-shrink-0">
                <div className="w-48 h-48 rounded-full bg-[#08090a] flex items-center justify-center">
                  <TrendingUp className="w-24 h-24 text-[#c8a96e]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { data: properties } = await supabase
    .from('properties')
    .select(`
      *,
      property_images (
        id,
        image_url,
        display_order
      )
    `)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  const propertiesWithImages = properties?.map((property) => ({
    ...property,
    images: property.property_images || [],
  })) || [];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-[#f0f0f0]">
              Mes annonces
            </h1>
            <p className="text-[#8b8fa8]">
              {propertiesWithImages.length} annonce{propertiesWithImages.length !== 1 ? 's' : ''} active{propertiesWithImages.length !== 1 ? 's' : ''}
            </p>
          </div>

          <Link href="/sell/new">
            <button className="bg-[#c8a96e] text-[#08090a] font-semibold px-6 py-3 rounded-xl hover:bg-[#d4b87a] transition-all flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Ajouter une annonce
            </button>
          </Link>
        </div>

        {propertiesWithImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {propertiesWithImages.map((property) => (
              <div
                key={property.id}
                className="bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden hover:border-[rgba(200,169,110,0.3)] transition-all"
              >
                <div className="relative h-48 bg-[#1a1d24]">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={property.images[0].image_url}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="w-16 h-16 text-[#4a4d5e]" />
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2 text-[#f0f0f0]">
                    {property.title}
                  </h3>
                  <p className="text-[#8b8fa8] text-sm mb-4">{property.location}</p>
                  <p className="text-[#c8a96e] font-semibold mb-4">
                    {property.price_per_month.toLocaleString('fr-FR')} DZD/mois
                  </p>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/sell/edit/${property.id}`}
                      className="flex-1 text-center border border-[rgba(255,255,255,0.12)] text-[#f0f0f0] px-4 py-2 rounded-lg hover:border-[#c8a96e] hover:text-[#c8a96e] transition-all text-sm"
                    >
                      Modifier
                    </Link>
                    {!property.is_available && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-[rgba(239,68,68,0.15)] text-[#ef4444]">
                        Non disponible
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-2xl p-12 text-center">
            <Home className="w-16 h-16 mx-auto mb-4 text-[#8b8fa8]" />
            <p className="text-[#8b8fa8] mb-6">
              Vous n'avez pas encore d'annonces
            </p>
            <Link href="/sell/new">
              <button className="bg-[#c8a96e] text-[#08090a] font-semibold px-6 py-3 rounded-xl hover:bg-[#d4b87a] transition-all flex items-center gap-2 mx-auto">
                <Plus className="w-5 h-5" />
                Créer ma première annonce
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
