import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import Image from 'next/image';
import { MapPin, Bed, Bath, Maximize, Calendar, User, CheckCircle } from 'lucide-react';

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (!property) {
    redirect('/properties');
  }

  const { data: images } = await supabase
    .from('property_images')
    .select('*')
    .eq('property_id', id)
    .order('display_order', { ascending: true });

  const { data: owner } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', property.owner_id)
    .single();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {images && images.length > 0 ? (
              <div className="mb-8">
                {images.length === 1 ? (
                  <div className="relative h-96 rounded-2xl overflow-hidden">
                    <Image
                      src={images[0].image_url}
                      alt={property.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative h-96 rounded-2xl overflow-hidden col-span-2">
                      <Image
                        src={images[0].image_url}
                        alt={property.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {images.slice(1).map((image) => (
                      <div
                        key={image.id}
                        className="relative h-48 rounded-2xl overflow-hidden"
                      >
                        <Image
                          src={image.image_url}
                          alt={property.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-8 h-96 bg-[#1a1d24] rounded-2xl flex items-center justify-center">
                <p className="text-[#8b8fa8]">Aucune image disponible</p>
              </div>
            )}

            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-[#f0f0f0]">
                {property.title}
              </h1>

              <div className="flex items-center gap-2 text-[#8b8fa8] mb-6">
                <MapPin className="w-5 h-5 text-[#c8a96e]" />
                <span>{property.location}</span>
              </div>

              <div className="flex flex-wrap gap-6 mb-8">
                {property.bedrooms && (
                  <div className="flex items-center gap-2 text-[#8b8fa8]">
                    <Bed className="w-5 h-5" />
                    <span>{property.bedrooms} chambre{property.bedrooms > 1 ? 's' : ''}</span>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center gap-2 text-[#8b8fa8]">
                    <Bath className="w-5 h-5" />
                    <span>{property.bathrooms} salle{property.bathrooms > 1 ? 's' : ''} de bain</span>
                  </div>
                )}
                {property.surface_area && (
                  <div className="flex items-center gap-2 text-[#8b8fa8]">
                    <Maximize className="w-5 h-5" />
                    <span>{property.surface_area}m²</span>
                  </div>
                )}
              </div>

              {property.description && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4 text-[#f0f0f0]">
                    Description
                  </h2>
                  <p className="text-[#8b8fa8] leading-relaxed whitespace-pre-line">
                    {property.description}
                  </p>
                </div>
              )}

              {owner && (
                <div className="bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6">
                  <h2 className="text-xl font-bold mb-4 text-[#f0f0f0]">
                    Informations sur le vendeur
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#c8a96e] flex items-center justify-center text-[#08090a] font-bold">
                      {getInitials(owner.full_name)}
                    </div>
                    <div>
                      <p className="text-[#f0f0f0] font-medium">
                        {owner.full_name}
                      </p>
                      <p className="text-[#8b8fa8] text-sm">
                        Membre depuis {formatDate(owner.created_at || '')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6">
                <div className="mb-6">
                  <p className="text-[#8b8fa8] text-sm mb-2">Prix par mois</p>
                  <p className="text-3xl font-bold text-[#c8a96e]">
                    {property.price_per_month.toLocaleString('fr-FR')} DZD
                  </p>
                </div>

                <a
                  href={`/visits/new?property_id=${property.id}`}
                  className="block w-full bg-[#c8a96e] text-[#08090a] font-semibold py-3 rounded-xl hover:bg-[#d4b87a] transition-all text-center mb-6"
                >
                  Réserver une visite
                </a>

                <div className="border-t border-[rgba(255,255,255,0.08)] pt-6">
                  <h3 className="text-lg font-semibold mb-4 text-[#f0f0f0]">
                    Caractéristiques
                  </h3>

                  <div className="space-y-3">
                    {property.bedrooms && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#8b8fa8]">Chambres</span>
                        <span className="text-[#f0f0f0] font-medium">
                          {property.bedrooms}
                        </span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#8b8fa8]">Salles de bain</span>
                        <span className="text-[#f0f0f0] font-medium">
                          {property.bathrooms}
                        </span>
                      </div>
                    )}
                    {property.surface_area && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#8b8fa8]">Surface</span>
                        <span className="text-[#f0f0f0] font-medium">
                          {property.surface_area}m²
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {property.is_available && (
                  <div className="mt-6 flex items-center gap-2 text-[#22c55e]">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Disponible</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
