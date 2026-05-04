'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import type { Property } from '@/types';
import { MapPin, Bed, Bath, Maximize, Heart, Home } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const mainImage = property.images?.[0]?.image_url || property.image_url;

  return (
    <Link href={`/properties/${property.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className="bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden hover:border-[rgba(200,169,110,0.3)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.6)] transition-all duration-200"
      >
        <div className="relative h-64 overflow-hidden">
          {mainImage ? (
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              <Image
                src={mainImage}
                alt={property.title}
                fill
                className="object-cover"
              />
            </motion.div>
          ) : (
            <div className="w-full h-full bg-[#1a1d24] flex items-center justify-center">
              <Home className="w-16 h-16 text-[#4a4d5e]" />
            </div>
          )}

          <div className="absolute bottom-4 left-4 bg-[#c8a96e] text-[#08090a] px-3 py-1 rounded-lg font-semibold">
            {property.price_per_month.toLocaleString('fr-FR')} DZD/mois
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <Heart className="w-5 h-5 text-white" />
          </motion.button>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-semibold mb-2 text-[#f0f0f0]">{property.title}</h3>

          <div className="flex items-center gap-2 text-[#8b8fa8] mb-4">
            <MapPin className="w-4 h-4 text-[#c8a96e]" />
            <span className="text-sm">{property.location}</span>
          </div>

          <div className="flex items-center gap-4 text-[#8b8fa8] mb-4">
            {property.bedrooms && (
              <div className="flex items-center gap-1">
                <Bed className="w-4 h-4" />
                <span className="text-sm">{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-1">
                <Bath className="w-4 h-4" />
                <span className="text-sm">{property.bathrooms}</span>
              </div>
            )}
            {property.surface_area && (
              <div className="flex items-center gap-1">
                <Maximize className="w-4 h-4" />
                <span className="text-sm">{property.surface_area}m²</span>
              </div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ opacity: 1, y: 0 }}
            className="opacity-0"
          >
            <button className="w-full bg-[#c8a96e] text-[#08090a] font-semibold py-3 rounded-xl hover:bg-[#d4b87a] transition-all">
              Voir le bien
            </button>
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
}
