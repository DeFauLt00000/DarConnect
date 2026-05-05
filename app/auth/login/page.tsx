'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { Loader2 } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      // Get redirect URL from search params or default to profile
      const redirectUrl = searchParams.get('redirect') || '/profile';
      router.push(redirectUrl);
      router.refresh();
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#08090a]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl mx-4"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-0">
          <div className="bg-[#111318] p-8 lg:p-12 rounded-2xl lg:rounded-l-2xl lg:rounded-r-none">
            <div className="max-w-md mx-auto">
              <h1 className="text-3xl font-bold mb-2 text-[#f0f0f0]">
                Bon retour 👋
              </h1>
              <p className="text-[#8b8fa8] mb-8">
                Connectez-vous à votre compte Dar-Connect
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#f0f0f0] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-[#111318] border border-[rgba(255,255,255,0.12)] rounded-xl text-[#f0f0f0] placeholder-[#4a4d5e] focus:border-[#c8a96e] focus:outline-none focus:shadow-[0_0_0_3px_rgba(200,169,110,0.15)] transition-all"
                    placeholder="vous@exemple.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#f0f0f0] mb-2">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-[#111318] border border-[rgba(255,255,255,0.12)] rounded-xl text-[#f0f0f0] placeholder-[#4a4d5e] focus:border-[#c8a96e] focus:outline-none focus:shadow-[0_0_0_3px_rgba(200,169,110,0.15)] transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="text-right">
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-[#c8a96e] hover:text-[#d4b87a] transition-colors"
                  >
                    Mot de passe oublié ?
                  </Link>
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
                      Connexion...
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </motion.button>
              </form>

              <p className="text-center mt-8 text-[#8b8fa8]">
                Pas encore de compte ?{' '}
                <Link
                  href="/auth/register"
                  className="text-[#c8a96e] hover:text-[#d4b87a] transition-colors font-medium"
                >
                  S'inscrire
                </Link>
              </p>
            </div>
          </div>

          <div className="hidden lg:block bg-gradient-to-br from-[#c8a96e] to-[#d4b87a] p-12 rounded-r-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full filter blur-[64px]" />
              <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#08090a] rounded-full filter blur-[64px]" />
            </div>

            <div className="relative z-10 h-full flex flex-col justify-center">
              <div className="mb-8">
                <span className="text-[#08090a] text-4xl font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>
                  Dar
                </span>
                <span className="text-[#08090a] text-4xl font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>
                  Connect
                </span>
              </div>

              <blockquote className="text-2xl font-medium text-[#08090a] mb-6">
                "Dar-Connect a transformé ma recherche de logement. J'ai trouvé mon appartement idéal en seulement 3 jours !"
              </blockquote>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#08090a] flex items-center justify-center">
                  <span className="text-[#c8a96e] font-bold">KA</span>
                </div>
                <div>
                  <p className="text-[#08090a] font-medium">Karim A.</p>
                  <p className="text-[#08090a] opacity-70 text-sm">Locataire satisfait</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#08090a]"><Loader2 className="w-8 h-8 text-[#c8a96e] animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
