'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContextType, AuthUser } from '../types/Auth';
import Cookies from 'js-cookie';
import { createBrowserClient } from "@supabase/ssr";
import { useUserDetails } from "@/hooks/useUserDetails";
import { verifyRequiredFieldsPresent } from "@/lib/utils";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const COOKIE_NAME = 'auth';
const COOKIE_OPTIONS = {
  expires: 7,
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // ✅ new state
  const { getUser } = useUserDetails();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const userDetails = await getUser();
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email!,
            role: session.user.user_metadata.role || 'USER',
            emailVerified: session.user.user_metadata.email_verified,
            displayName: session.user.user_metadata.display_name,
            isLoginnedIn: true,
            additionalData: userDetails,
            isProfileCompleted: verifyRequiredFieldsPresent(userDetails),
            phoneVerified: false
          };
          setUser(authUser);
          setAccessToken(session.access_token);
          Cookies.set(
            COOKIE_NAME,
            JSON.stringify({ user: authUser, accessToken: session.access_token }),
            COOKIE_OPTIONS
          );
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        logout();
      } finally {
        setIsLoading(false); // ✅ done loading
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          logout();
        } else if (session) {
          const userDetails = await getUser();
          login({
            user: session.user,
            access_token: session.access_token,
            userDetails,
            isLoginnedIn: true,
            isProfileCompleted: verifyRequiredFieldsPresent(userDetails)
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (data: Partial<AuthUser> & { access_token?: string; user?: any; userDetails?: any; redirect?: string }) => {
    const prevAuth = user; 
    const authUser: AuthUser = {
      ...prevAuth,
      ...(data.user && {
        id: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role || data.user.role || 'USER',
        emailVerified: data.user.user_metadata?.email_verified,
        displayName: data.user.user_metadata?.display_name || '',
      }),
      ...(data.userDetails && { additionalData: data.userDetails }),
      ...(data.isLoginnedIn !== undefined && { isLoginnedIn: data.isLoginnedIn }),
      ...(data.phoneVerified !== undefined && { phoneVerified: data.phoneVerified }),
      ...(data.isProfileCompleted !== undefined && { isProfileCompleted: data.isProfileCompleted }),
    };

    console.log('Setting user with role:', authUser.role); // Debug log
    
    setUser(authUser);
    if (data.access_token) {
      setAccessToken(data.access_token);
      Cookies.set(
        COOKIE_NAME,
        JSON.stringify({ user: authUser, accessToken: data.access_token }),
        COOKIE_OPTIONS
      );
    }

    // Only redirect if a redirect path is provided
    if (data.redirect) {
      router.push(data.redirect);
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    Cookies.remove(COOKIE_NAME, { path: '/' });
    router.push('/');
  };

  const updateAuth = (updates: Partial<AuthUser>) => {
    if (!user) return;
    const updatedUser: AuthUser = { ...user, ...updates };
    setUser(updatedUser);
    Cookies.set(
      COOKIE_NAME,
      JSON.stringify({ user: updatedUser, accessToken }),
      COOKIE_OPTIONS
    );
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, updateAuth, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
