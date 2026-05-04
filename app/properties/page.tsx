'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase-browser';
import PropertyCard from '@/components/PropertyCard';
import type { Property } from '@/types';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState('');
  const [searchBedrooms, setSearchBedrooms] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        property_images (
          id,
          image_url,
          display_order
        )
      `)
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (data && !error) {
      const propertiesWithImages = data.map((property) => ({
        ...property,
        images: property.property_images || [],
      }));
      setProperties(propertiesWithImages);
    }
    setLoading(false);
  };

  const filteredProperties = properties.filter((property) => {
    const matchesLocation =
      !searchLocation ||
      property.location.toLowerCase().includes(searchLocation.toLowerCase());
    const matchesBedrooms =
      !searchBedrooms ||
      (property.bedrooms && property.bedrooms >= parseInt(searchBedrooms));
    return matchesLocation && matchesBedrooms;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-[#f0f0f0]">
            Biens disponibles
          </h1>
          <p className="text-[#8b8fa8]">
            {filteredProperties.length} bien{filteredProperties.length !== 1 ? 's' : ''} disponible{filteredProperties.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8b8fa8]" />
            <input
              type="text"
              placeholder="Rechercher par localisation..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#111318] border border-[rgba(255,255,255,0.12)] rounded-xl text-[#f0f0f0] placeholder-[#4a4d5e] focus:border-[#c8a96e] focus:outline-none focus:shadow-[0_0_0_3px_rgba(200,169,110,0.15)] transition-all"
            />
          </div>

          <div className="sm:w-48">
            <select
              value={searchBedrooms}
              onChange={(e) => setSearchBedrooms(e.target.value)}
              className="w-full px-4 py-3 bg-[#111318] border border-[rgba(255,255,255,0.12)] rounded-xl text-[#f0f0f0] focus:border-[#c8a96e] focus:outline-none focus:shadow-[0_0_0_3px_rgba(200,169,110,0.15)] transition-all appearance-none cursor-pointer"
            >
              <option value="">Toutes les chambres</option>
              <option value="1">1+ chambre</option>
              <option value="2">2+ chambres</option>
              <option value="3">3+ chambres</option>
              <option value="4">4+ chambres</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-2xl h-96 animate-pulse"
              />
            ))}
          </div>
        ) : filteredProperties.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </motion.div>
        ) : (
          <div className="bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-2xl p-12 text-center">
            <Filter className="w-16 h-16 mx-auto mb-4 text-[#8b8fa8]" />
            <p className="text-[#8b8fa8] mb-4">
              Aucun bien ne correspond à votre recherche
            </p>
            <button
              onClick={() => {
                setSearchLocation('');
                setSearchBedrooms('');
              }}
              className="text-[#c8a96e] hover:text-[#d4b87a] transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
