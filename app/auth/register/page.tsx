'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { Loader2, Check, X } from 'lucide-react';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const passwordsMatch = password === confirmPassword && password.length > 0;
  const emailValid = validateEmail(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!emailValid) {
      setError('Adresse email invalide');
      return;
    }

    if (!passwordsMatch) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: fullName,
          role: 'tenant',
        });

        // Check if email confirmation is required
        if (!data.user.email_confirmed_at && data.user.identities?.length === 0) {
          // Email confirmation required
          setSuccess(true);
          setError('Veuillez confirmer votre email avant de vous connecter. Un lien de confirmation a été envoyé à votre adresse email.');
        } else {
          // Auto-login (email confirmation not required)
          router.push('/profile');
          router.refresh();
        }
      }
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
                Créer un compte
              </h1>
              <p className="text-[#8b8fa8] mb-8">
                Rejoignez Dar-Connect en quelques secondes
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#f0f0f0] mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#111318] border border-[rgba(255,255,255,0.12)] rounded-xl text-[#f0f0f0] placeholder-[#4a4d5e] focus:border-[#c8a96e] focus:outline-none focus:shadow-[0_0_0_3px_rgba(200,169,110,0.15)] transition-all"
                    placeholder="Jean Dupont"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#f0f0f0] mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-[#111318] border border-[rgba(255,255,255,0.12)] rounded-xl text-[#f0f0f0] placeholder-[#4a4d5e] focus:border-[#c8a96e] focus:outline-none focus:shadow-[0_0_0_3px_rgba(200,169,110,0.15)] transition-all"
                      placeholder="vous@exemple.com"
                      required
                    />
                    {email.length > 0 && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {emailValid ? (
                          <Check className="w-5 h-5 text-[#22c55e]" />
                        ) : (
                          <X className="w-5 h-5 text-[#ef4444]" />
                        )}
                      </div>
                    )}
                  </div>
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
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#f0f0f0] mb-2">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-[#111318] border border-[rgba(255,255,255,0.12)] rounded-xl text-[#f0f0f0] placeholder-[#4a4d5e] focus:border-[#c8a96e] focus:outline-none focus:shadow-[0_0_0_3px_rgba(200,169,110,0.15)] transition-all"
                      placeholder="••••••••"
                      required
                    />
                    {confirmPassword.length > 0 && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {passwordsMatch ? (
                          <Check className="w-5 h-5 text-[#22c55e]" />
                        ) : (
                          <X className="w-5 h-5 text-[#ef4444]" />
                        )}
                      </div>
                    )}
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
                      Inscription...
                    </>
                  ) : (
                    "S'inscrire"
                  )}
                </motion.button>
              </form>

              {success && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] text-[#22c55e] px-4 py-3 rounded-xl flex items-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  <span>Compte créé avec succès ! Veuillez confirmer votre email.</span>
                </motion.div>
              )}

              <p className="text-center mt-8 text-[#8b8fa8]">
                Déjà inscrit ?{' '}
                <Link
                  href="/auth/login"
                  className="text-[#c8a96e] hover:text-[#d4b87a] transition-colors font-medium"
                >
                  Se connecter
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
                "L'inscription a pris moins de 2 minutes. Ensuite, j'ai pu réserver ma première visite immédiatement !"
              </blockquote>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#08090a] flex items-center justify-center">
                  <span className="text-[#c8a96e] font-bold">SB</span>
                </div>
                <div>
                  <p className="text-[#08090a] font-medium">Sarah B.</p>
                  <p className="text-[#08090a] opacity-70 text-sm">Nouvelle utilisatrice</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
