'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import FileUpload from '@/components/FileUpload';
import { Loader2, CheckCircle, Calendar, Home, AlertCircle, Edit } from 'lucide-react';

function NewVisitContent() {
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('property_id');
  const router = useRouter();
  const supabase = createClient();

  const [property, setProperty] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [idScanFile, setIdScanFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  const fetchProperty = async () => {
    const { data: propertyData, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();

    if (propertyData && !error) {
      setProperty(propertyData);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && propertyData.owner_id === user.id) {
        setIsOwner(true);
      }
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!propertyId) {
      setError('Bien non spécifié');
      return;
    }

    if (!visitDate) {
      setError('Veuillez sélectionner une date de visite');
      return;
    }

    if (!idScanFile) {
      setError('Veuillez uploader votre pièce d\'identité');
      return;
    }

    setLoading(true);
    setUploading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('Vous devez être connecté pour réserver une visite');
        return;
      }

      const fileExt = idScanFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-id-scan.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('id-scans')
        .upload(fileName, idScanFile);

      if (uploadError) {
        setError('Erreur lors de l\'upload de la pièce d\'identité');
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('id-scans')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase.from('visits').insert({
        tenant_id: user.id,
        property_id: propertyId,
        visit_date: visitDate,
        id_scan_url: publicUrl,
        status: 'pending',
      });

      if (insertError) {
        setError('Erreur lors de la réservation de la visite');
        return;
      }

      setSuccess(true);
      setUploading(false);

      setTimeout(() => {
        router.push('/visits');
      }, 2000);
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-2xl p-12 text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-[#22c55e] flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-4 text-[#f0f0f0]">
            Visite réservée avec succès !
          </h2>
          <p className="text-[#8b8fa8]">
            Redirection vers vos visites...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-[#f0f0f0]">
            Réserver une visite
          </h1>
          <p className="text-[#8b8fa8]">
            Choisissez une date et uploadez votre pièce d'identité
          </p>
        </div>

        {property && (
          <div className="bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#c8a96e] flex items-center justify-center flex-shrink-0">
                <Home className="w-6 h-6 text-[#08090a]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#f0f0f0] mb-1">
                  {property.title}
                </h3>
                <p className="text-[#8b8fa8] text-sm mb-2">{property.location}</p>
                <p className="text-[#c8a96e] font-semibold">
                  {property.price_per_month.toLocaleString('fr-FR')} DZD/mois
                </p>
              </div>
            </div>
          </div>
        )}

        {isOwner ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#111318] border border-[rgba(200,169,110,0.3)] rounded-2xl p-8 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-[rgba(200,169,110,0.15)] flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-[#c8a96e]" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-[#f0f0f0]">
              Vous ne pouvez pas réserver une visite pour votre propre bien
            </h2>
            <p className="text-[#8b8fa8] mb-6">
              En tant que propriétaire, vous pouvez gérer cette annonce et voir les demandes de visite des locataires.
            </p>
            <a
              href={`/sell/edit/${propertyId}`}
              className="inline-flex items-center gap-2 bg-[#c8a96e] text-[#08090a] font-semibold px-6 py-3 rounded-xl hover:bg-[#d4b87a] transition-all"
            >
              <Edit className="w-5 h-5" />
              Gérer cette annonce
            </a>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#f0f0f0] mb-2">
              Date de visite
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8b8fa8]" />
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                min={getMinDate()}
                className="w-full pl-12 pr-4 py-3 bg-[#111318] border border-[rgba(255,255,255,0.12)] rounded-xl text-[#f0f0f0] focus:border-[#c8a96e] focus:outline-none focus:shadow-[0_0_0_3px_rgba(200,169,110,0.15)] transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#f0f0f0] mb-2">
              Pièce d'identité
            </label>
            <FileUpload
              onFileSelect={(file) => setIdScanFile(file)}
              accept="image/*,application/pdf"
            />
            <p className="text-[#4a4d5e] text-xs mt-2">
              Format accepté: JPG, PNG, PDF • Max 5MB
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#ef4444] px-4 py-3 rounded-xl"
            >
              {error}
            </motion.div>
          )}

          {uploading && (
            <div className="bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-[#c8a96e] animate-spin" />
                <span className="text-[#8b8fa8]">Upload en cours...</span>
              </div>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-[#c8a96e] text-[#08090a] font-semibold py-3 rounded-xl hover:bg-[#d4b87a] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Réservation en cours...
              </>
            ) : (
              'Confirmer la réservation'
            )}
          </motion.button>
        </form>
        )}
      </div>
    </div>
  );
}

export default function NewVisitPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 pb-16 flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#c8a96e] animate-spin" /></div>}>
      <NewVisitContent />
    </Suspense>
  );
}
