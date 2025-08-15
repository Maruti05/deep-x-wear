// types.ts
export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  role: string;
  displayName?: string; // Optional field for user's display name
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: AuthUser;
}
export interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  login: (data: any) => void;
  logout: () => void;
}
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    role: string;
    user_metadata: {
      email_verified: boolean;
      display_name: string;
    };
  };
}