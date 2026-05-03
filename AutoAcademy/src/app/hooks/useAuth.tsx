import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export interface Subscription {
  id: number;
  package_id: number;
  status: string;
  packages: {
    id: number;
    name: string;
    price: number;
  };
}

export interface User {
  id: string;
  email: string;
  is_admin: boolean;
  subscription?: Subscription | null;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  accessToken: string | null;
}

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a96c109b`;

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    accessToken: null,
  });

  useEffect(() => {
    // Handle email confirmation redirect (hash contains access_token)
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      if (accessToken) {
        localStorage.setItem('access_token', accessToken);
        if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
        window.location.hash = '';
        checkSession(accessToken);
        return;
      }
    }
    checkSession();
  }, []);

  const checkSession = async (token?: string) => {
    try {
      const storedToken = token || localStorage.getItem('access_token');
      if (!storedToken) {
        setAuthState({ user: null, loading: false, accessToken: null });
        return;
      }

      const response = await fetch(`${API_BASE}/auth/session`, {
        headers: { 'Authorization': `Bearer ${storedToken}` },
      });

      if (!response.ok) {
        // Try to refresh
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          await refreshSession(refreshToken);
          return;
        }
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setAuthState({ user: null, loading: false, accessToken: null });
        return;
      }

      const data = await response.json();

      if (data.profile) {
        setAuthState({
          user: {
            id: data.profile.id,
            email: data.profile.email,
            is_admin: data.profile.is_admin || false,
            subscription: data.subscription || null,
          },
          loading: false,
          accessToken: storedToken,
        });
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setAuthState({ user: null, loading: false, accessToken: null });
      }
    } catch (error) {
      console.error('Session check error:', error);
      setAuthState({ user: null, loading: false, accessToken: null });
    }
  };

  const refreshSession = async (refreshToken: string) => {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setAuthState({ user: null, loading: false, accessToken: null });
        return;
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
      await checkSession(data.access_token);
    } catch (error) {
      setAuthState({ user: null, loading: false, accessToken: null });
    }
  };

  const signUp = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al registrarse');
    return { success: true };
  };

  const signIn = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al iniciar sesión');

    localStorage.setItem('access_token', data.session.access_token);
    if (data.session.refresh_token) {
      localStorage.setItem('refresh_token', data.session.refresh_token);
    }

    setAuthState({
      user: {
        id: data.profile.id,
        email: data.profile.email,
        is_admin: data.profile.is_admin || false,
        subscription: null,
      },
      loading: false,
      accessToken: data.session.access_token,
    });

    // Fetch full session with subscription
    await checkSession(data.session.access_token);
    return { success: true };
  };

  const signOut = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        await fetch(`${API_BASE}/auth/signout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error('Signout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setAuthState({ user: null, loading: false, accessToken: null });
    }
  };

  const refreshUser = () => {
    const token = localStorage.getItem('access_token');
    if (token) checkSession(token);
  };

  return {
    user: authState.user,
    loading: authState.loading,
    accessToken: authState.accessToken,
    signUp,
    signIn,
    signOut,
    refreshUser,
  };
}
