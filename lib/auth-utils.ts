import { createClient } from '@/lib/supabase-browser';

export async function clearSessionAndRedirect() {
  const supabase = createClient();

  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Error signing out:', error);
  }

  // Clear all storage
  if (typeof window !== 'undefined') {
    localStorage.clear();
    sessionStorage.clear();
  }

  // Redirect to login
  window.location.href = '/auth/login';
}

export function handleAuthError(error: any) {
  console.error('Auth error:', error);

  if (error?.message?.includes('Refresh Token Not Found') ||
      error?.message?.includes('Invalid Refresh Token')) {
    clearSessionAndRedirect();
  }
}
