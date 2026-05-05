'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';
import { handleAuthError } from '@/lib/auth-utils';
import type { User } from '@supabase/supabase-js';
import { Menu, X, MapPin, Home, Calendar, User as UserIcon, LogOut, LayoutDashboard, CalendarCheck } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'tenant' | 'seller' | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        setUser(session?.user ?? null);

        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          setUserRole(profile?.role || 'tenant');
        } else {
          setUserRole(null);
        }
      } catch (error) {
        handleAuthError(error);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserRole(null);
      setUserMenuOpen(false);
      // Force a page reload to clear any cached state
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, try to clear local state
      setUser(null);
      setUserRole(null);
      setUserMenuOpen(false);
      window.location.href = '/';
    }
  };

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/properties', label: 'Biens' },
    { href: '/visits', label: 'Mes visites' },
    { href: '/sell', label: 'Vendre' },
  ];

  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-black/80 backdrop-blur-lg' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-white text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>
                Dar
              </span>
              <span className="text-[#c8a96e] text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>
                Connect
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="relative group">
                  <span className="text-[#f0f0f0] hover:text-[#c8a96e] transition-colors">
                    {link.label}
                  </span>
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-[#c8a96e]"
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.2 }}
                  />
                </Link>
              ))}

              {!user ? (
                <div className="flex items-center gap-4">
                  <Link href="/auth/login">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                      className="border border-[rgba(255,255,255,0.12)] text-[#f0f0f0] px-6 py-3 rounded-xl hover:border-[#c8a96e] hover:text-[#c8a96e] transition-all"
                    >
                      Se connecter
                    </motion.button>
                  </Link>
                  <Link href="/auth/register">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                      className="bg-[#c8a96e] text-[#08090a] font-semibold px-6 py-3 rounded-xl hover:bg-[#d4b87a] transition-all"
                    >
                      S'inscrire
                    </motion.button>
                  </Link>
                </div>
              ) : (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="w-10 h-10 rounded-full bg-[#c8a96e] flex items-center justify-center text-[#08090a] font-semibold"
                  >
                    {getUserInitials()}
                  </motion.button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-xl shadow-xl overflow-hidden"
                      >
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-3 hover:bg-[rgba(200,169,110,0.1)] transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <UserIcon className="w-4 h-4 text-[#c8a96e]" />
                          <span>Mon profil</span>
                        </Link>
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 px-4 py-3 hover:bg-[rgba(200,169,110,0.1)] transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4 text-[#c8a96e]" />
                          <span>Mon tableau de bord</span>
                        </Link>
                        {userRole === 'seller' && (
                          <Link
                            href="/sell/visits"
                            className="flex items-center gap-3 px-4 py-3 hover:bg-[rgba(200,169,110,0.1)] transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <CalendarCheck className="w-4 h-4 text-[#c8a96e]" />
                            <span>Mes réservations</span>
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[rgba(239,68,68,0.1)] transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4 text-[#ef4444]" />
                          <span>Se déconnecter</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-[#f0f0f0]" />
              ) : (
                <Menu className="w-6 h-6 text-[#f0f0f0]" />
              )}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-[#08090a] md:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-2xl text-[#f0f0f0] hover:text-[#c8a96e] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {!user ? (
                <div className="flex flex-col gap-4">
                  <Link
                    href="/auth/login"
                    className="text-2xl text-[#f0f0f0] hover:text-[#c8a96e] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Se connecter
                  </Link>
                  <Link
                    href="/auth/register"
                    className="text-2xl text-[#c8a96e] hover:text-[#d4b87a] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    S'inscrire
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <Link
                    href="/profile"
                    className="text-2xl text-[#f0f0f0] hover:text-[#c8a96e] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mon profil
                  </Link>
                  <Link
                    href="/dashboard"
                    className="text-2xl text-[#f0f0f0] hover:text-[#c8a96e] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mon tableau de bord
                  </Link>
                  {userRole === 'seller' && (
                    <Link
                      href="/sell/visits"
                      className="text-2xl text-[#f0f0f0] hover:text-[#c8a96e] transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Mes réservations
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-2xl text-[#ef4444] hover:text-[#dc2626] transition-colors"
                  >
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>

            <button
              className="absolute top-6 right-6"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="w-6 h-6 text-[#f0f0f0]" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
