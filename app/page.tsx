'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';
import PropertyCard from '@/components/PropertyCard';
import type { Property } from '@/types';
import { Search, MapPin, Home, Calendar, Shield, TrendingUp, Users, Star, ArrowRight, Check } from 'lucide-react';

export default function HomePage() {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [searchLocation, setSearchLocation] = useState('');
  const [searchBedrooms, setSearchBedrooms] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  const fetchFeaturedProperties = async () => {
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
      .limit(6)
      .order('created_at', { ascending: false });

    if (data && !error) {
      const propertiesWithImages = data.map((property) => ({
        ...property,
        images: property.property_images || [],
      }));
      setFeaturedProperties(propertiesWithImages);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchLocation) params.set('location', searchLocation);
    if (searchBedrooms) params.set('bedrooms', searchBedrooms);
    window.location.href = `/properties?${params.toString()}`;
  };

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
    <div className="min-h-screen">
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#08090a] via-[#111318] to-[#08090a]" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#c8a96e] rounded-full filter blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#4f8ef7] rounded-full filter blur-[128px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-[rgba(200,169,110,0.1)] border border-[rgba(200,169,110,0.3)] px-4 py-2 rounded-full mb-8"
          >
            <Home className="w-4 h-4 text-[#c8a96e]" />
            <span className="text-[#c8a96e] text-sm font-medium">
              La plateforme immobilière N°1 en Algérie
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl lg:text-7xl font-bold mb-6"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            <div className="text-[#f0f0f0]">Trouvez le bien</div>
            <div className="text-transparent bg-clip-text bg-gradient-to-r from-[#c8a96e] to-[#d4b87a]">
              de vos rêves
            </div>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-[#8b8fa8] mb-12 max-w-2xl mx-auto"
          >
            Des milliers de logements premium à travers toute l'Algérie
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto"
          >
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8b8fa8]" />
              <input
                type="text"
                placeholder="Localisation"
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
                <option value="">Chambres</option>
                <option value="1">1 chambre</option>
                <option value="2">2 chambres</option>
                <option value="3">3 chambres</option>
                <option value="4">4+ chambres</option>
              </select>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="bg-[#c8a96e] text-[#08090a] font-semibold px-8 py-3 rounded-xl hover:bg-[#d4b87a] transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Rechercher
            </motion.button>
          </motion.form>
        </motion.div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { icon: Home, label: 'Biens disponibles', value: '2 400+', color: '#c8a96e' },
              { icon: Users, label: 'Locataires satisfaits', value: '1 800+', color: '#4f8ef7' },
              { icon: MapPin, label: 'Wilayas couvertes', value: '48', color: '#22c55e' },
              { icon: Star, label: 'Note moyenne', value: '4.9★', color: '#f59e0b' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 text-center hover:border-[rgba(200,169,110,0.3)] transition-all"
              >
                <stat.icon className="w-8 h-8 mx-auto mb-4" style={{ color: stat.color }} />
                <div className="text-3xl font-bold mb-2" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="text-[#8b8fa8] text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-[#0d0e10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-[#f0f0f0]">
              Biens en vedette
            </h2>
            <p className="text-[#8b8fa8]">
              Découvrez nos meilleures offres du moment
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </motion.div>

          {featuredProperties.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#8b8fa8]">Aucun bien disponible pour le moment</p>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link href="/properties">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="bg-[#c8a96e] text-[#08090a] font-semibold px-8 py-3 rounded-xl hover:bg-[#d4b87a] transition-all flex items-center gap-2 mx-auto"
              >
                Voir tous les biens
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-[#f0f0f0]">
              Comment ça marche
            </h2>
            <p className="text-[#8b8fa8]">
              En 3 étapes simples, trouvez votre logement idéal
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Users,
                title: 'Créez votre compte',
                description: 'Inscrivez-vous gratuitement en 2 minutes',
              },
              {
                icon: Search,
                title: 'Parcourez les biens',
                description: 'Explorez des milliers d\'annonces vérifiées',
              },
              {
                icon: Calendar,
                title: 'Réservez une visite',
                description: 'Choisissez une date et uploadez votre pièce d\'identité',
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-[#c8a96e] flex items-center justify-center mx-auto mb-6">
                  <step.icon className="w-8 h-8 text-[#08090a]" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-[#f0f0f0]">
                  {step.title}
                </h3>
                <p className="text-[#8b8fa8]">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-[#0d0e10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#111318] border-2 border-[#c8a96e] rounded-2xl p-8 lg:p-12 text-center"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-[#f0f0f0]">
              Vous avez un bien à louer ?
            </h2>
            <p className="text-[#8b8fa8] mb-8 max-w-2xl mx-auto">
              Devenez vendeur et publiez votre annonce gratuitement
            </p>
            <Link href="/sell">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="bg-[#c8a96e] text-[#08090a] font-semibold px-8 py-3 rounded-xl hover:bg-[#d4b87a] transition-all"
              >
                Commencer à vendre
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 border-t border-[rgba(255,255,255,0.08)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-white text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>
                Dar
              </span>
              <span className="text-[#c8a96e] text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>
                Connect
              </span>
            </div>

            <div className="flex items-center gap-6">
              <Link href="/properties" className="text-[#8b8fa8] hover:text-[#c8a96e] transition-colors">
                Biens
              </Link>
              <Link href="/visits" className="text-[#8b8fa8] hover:text-[#c8a96e] transition-colors">
                Visites
              </Link>
              <Link href="/sell" className="text-[#8b8fa8] hover:text-[#c8a96e] transition-colors">
                Vendre
              </Link>
            </div>

            <p className="text-[#4a4d5e] text-sm">
              © 2025 Dar-Connect. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
