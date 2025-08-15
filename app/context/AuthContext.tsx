// context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContextType, AuthResponse, AuthUser } from '../types/Auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('auth');
    if (stored) {
      const { user, accessToken } = JSON.parse(stored);
      setUser(user);
      setAccessToken(accessToken);
    }
  }, []);

  const login = (data: any) => {
    const authUser: AuthUser = {
      id: data.user.id,
      email: data.user.email,
      role: data.user.role,
      emailVerified: data.user.user_metadata.email_verified,
      phoneVerified: false, // Assuming phone verification is not handled here
      displayName: data.user.user_metadata.display_name || '', // Optional field
    };

    setUser(authUser);
    setAccessToken(data.access_token);

    sessionStorage.setItem(
      'auth',
      JSON.stringify({
        user: authUser,
        accessToken: data.access_token,
      })
    );

    router.push('/'); // or dashboard or wherever
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    sessionStorage.removeItem('auth');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout }}>
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
