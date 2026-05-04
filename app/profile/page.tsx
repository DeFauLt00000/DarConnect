'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { User, Mail, Phone, Save, CheckCircle, TrendingUp, Shield, Zap } from 'lucide-react';

export default function ProfilePage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'tenant' | 'seller'>('tenant');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setEmail(user.email || '');

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || '');
        setPhone(profile.phone || '');
        setRole(profile.role || 'tenant');
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('Vous devez être connecté');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone || null,
        })
        .eq('id', user.id);

      if (error) {
        setError('Erreur lors de la mise à jour du profil');
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleBecomeSeller = async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('Vous devez être connecté');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ role: 'seller' })
        .eq('id', user.id);

      if (error) {
        setError('Erreur lors de la mise à jour du rôle');
        return;
      }

      setRole('seller');
      router.push('/sell');
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    return fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-[#f0f0f0]">
            Mon profil
          </h1>
          <p className="text-[#8b8fa8]">
            Gérez vos informations personnelles
          </p>
        </div>

        <div className="bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-[#c8a96e] flex items-center justify-center text-[#08090a] text-2xl font-bold">
              {getInitials()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#f0f0f0] mb-1">
                {fullName || 'Non renseigné'}
              </h2>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    role === 'seller'
                      ? 'bg-[rgba(200,169,110,0.15)] text-[#c8a96e]'
                      : 'bg-[rgba(79,142,247,0.15)] text-[#4f8ef7]'
                  }`}
                >
                  {role === 'seller' ? 'Vendeur' : 'Locataire'}
                </span>
              </div>
            </div>
          </div>

          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#f0f0f0] mb-2">
                Nom complet
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8b8fa8]" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#111318] border border-[rgba(255,255,255,0.12)] rounded-xl text-[#f0f0f0] placeholder-[#4a4d5e] focus:border-[#c8a96e] focus:outline-none focus:shadow-[0_0_0_3px_rgba(200,169,110,0.15)] transition-all"
                  placeholder="Jean Dupont"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#f0f0f0] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8b8fa8]" />
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full pl-12 pr-4 py-3 bg-[#1a1d24] border border-[rgba(255,255,255,0.06)] rounded-xl text-[#4a4d5e] cursor-not-allowed"
                />
              </div>
              <p className="text-[#4a4d5e] text-xs mt-2">
                L'email ne peut pas être modifié
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#f0f0f0] mb-2">
                Téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8b8fa8]" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#111318] border border-[rgba(255,255,255,0.12)] rounded-xl text-[#f0f0f0] placeholder-[#4a4d5e] focus:border-[#c8a96e] focus:outline-none focus:shadow-[0_0_0_3px_rgba(200,169,110,0.15)] transition-all"
                  placeholder="+213 555 123 456"
                />
              </div>
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

            {success && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] text-[#22c55e] px-4 py-3 rounded-xl flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Profil mis à jour avec succès</span>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-[#c8a96e] text-[#08090a] font-semibold py-3 rounded-xl hover:bg-[#d4b87a] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                'Enregistrement...'
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Enregistrer
                </>
              )}
            </motion.button>
          </form>
        </div>

        {role === 'tenant' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#c8a96e] to-[#d4b87a] rounded-2xl p-8"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#08090a] flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-[#c8a96e]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#08090a] mb-2">
                  Devenez vendeur
                </h3>
                <p className="text-[#08090a] opacity-80 mb-4">
                  Publiez vos annonces gratuitement et atteignez des milliers de locataires potentiels
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBecomeSeller}
              disabled={loading}
              className="w-full bg-[#08090a] text-[#c8a96e] font-semibold py-3 rounded-xl hover:bg-[#1a1d24] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                'Activation en cours...'
              ) : (
                'Devenir vendeur'
              )}
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
