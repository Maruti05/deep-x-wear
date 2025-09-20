// context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContextType, AuthResponse, AuthUser } from '../types/Auth';
import Cookies from 'js-cookie';
import { createBrowserClient } from "@supabase/ssr";
import { useUserDetails } from "@/hooks/useUserDetails";
import { verifyRequiredFieldsPresent } from "@/lib/utils";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cookie configuration
const COOKIE_NAME = 'auth';
const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const, // Allow cross-site navigation while maintaining security
  // Note: HttpOnly can't be set with js-cookie in the browser
  // It should be set on the server-side when possible
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const { getUser } = useUserDetails();

  // Initialize Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // Check Supabase session on mount
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Get additional user details from your API
          const userDetails = await getUser();
          
          // Reconstruct auth state
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

          // Update cookie
          Cookies.set(
            COOKIE_NAME,
            JSON.stringify({
              user: authUser,
              accessToken: session.access_token,
            }),
            COOKIE_OPTIONS
          );
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        // Clear potentially invalid auth state
        logout();
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          logout();
        } else if (session) {
          // Update auth state with new session
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

    return () => {
      subscription.unsubscribe();
    };
  }, []);

const login = (data: Partial<AuthUser> & { access_token?: string; user?: any; userDetails?: any }) => {
  console.log("login data", data);

  // Use existing user state as base
  const prevAuth = user; 

  const authUser: AuthUser = {
    ...prevAuth, // keep existing fields
    ...(data.user && {
      id: data.user.id,
      email: data.user.email,
      role: data.user.role,
      emailVerified: data.user.user_metadata?.email_verified,
      displayName: data.user.user_metadata?.display_name || '',
    }),
    ...(data.userDetails && { additionalData: data.userDetails }),
    ...(data.isLoginnedIn !== undefined && { isLoginnedIn: data.isLoginnedIn }),
    ...(data.phoneVerified !== undefined && { phoneVerified: data.phoneVerified }),
    ...(data.isProfileCompleted !== undefined && { isProfileCompleted: data.isProfileCompleted }),
  };

  setUser(authUser);

  if (data.access_token) {
    setAccessToken(data.access_token);

    // Store auth data in cookies instead of sessionStorage
    Cookies.set(
      COOKIE_NAME,
      JSON.stringify({
        user: authUser,
        accessToken: data.access_token,
      }),
      COOKIE_OPTIONS
    );
  }

  router.push("/"); // navigate after login
};


  const logout = () => {
    setUser(null);
    setAccessToken(null);
    // Remove auth cookie instead of sessionStorage
    Cookies.remove(COOKIE_NAME, { path: '/' });
    router.push('/');
  };
 const updateAuth = (updates: Partial<AuthUser>) => {
    if (!user) return;

    const updatedUser: AuthUser = {
      ...user,
      ...updates, // only update passed fields
    };

    
    setUser(updatedUser);
    // Update auth cookie instead of sessionStorage
    Cookies.set(
      COOKIE_NAME,
      JSON.stringify({
        user: updatedUser,
        accessToken,
      }),
      COOKIE_OPTIONS
    );
  };
  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout ,updateAuth}}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
