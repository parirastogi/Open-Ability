'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  onboardingCompleted: boolean;
  onboardingStep: string;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  refreshUser: () => Promise<void>;
  setOnboardingState: (completed: boolean, step?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState('NAME');
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
          setOnboardingCompleted(data.profile?.onboardingCompleted || false);
          setOnboardingStep(data.profile?.onboardingStep || 'NAME');
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (e) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  // Route Protection Middleware Guard
  useEffect(() => {
    if (loading) return;

    const isProtectedRoute = pathname?.startsWith('/dashboard') || pathname === '/onboarding';
    const isAuthRoute = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password';

    if (isProtectedRoute && !isAuthenticated) {
      router.push('/login');
    } else if (pathname === '/onboarding' && isAuthenticated && onboardingCompleted) {
      router.push('/dashboard');
    } else if (isAuthRoute && isAuthenticated) {
      if (onboardingCompleted) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    }
  }, [pathname, isAuthenticated, onboardingCompleted, loading]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed.' };
      }

      setUser(data.user);
      setIsAuthenticated(true);
      setOnboardingCompleted(data.onboardingCompleted);
      setOnboardingStep(data.onboardingStep || 'NAME');

      if (data.onboardingCompleted) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error.' };
    }
  };

  const signup = async (fullName: string, email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Signup failed.' };
      }

      setUser(data.user);
      setIsAuthenticated(true);
      setOnboardingCompleted(false);
      setOnboardingStep('NAME');
      router.push('/onboarding');

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setOnboardingCompleted(false);
      router.push('/login');
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      return { success: res.ok, message: data.message, error: data.error };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error.' };
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });
      const data = await res.json();
      return { success: res.ok, message: data.message, error: data.error };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error.' };
    }
  };

  const setOnboardingState = (completed: boolean, step?: string) => {
    setOnboardingCompleted(completed);
    if (step) setOnboardingStep(step);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        onboardingCompleted,
        onboardingStep,
        loading,
        login,
        signup,
        logout,
        forgotPassword,
        resetPassword,
        refreshUser,
        setOnboardingState
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
