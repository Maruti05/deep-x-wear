// components/RoleGuard.tsx
"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to load
    if (!user) {
      router.replace("/login"); // not logged in
      return;
    }

    // Check role
    if (!allowedRoles.includes(user.role)) {
      router.replace("/403"); // forbidden page
    }
  }, [user, router, allowedRoles]);

  if (!user) return null; // or loading spinner

  return <>{allowedRoles.includes(user.role) && children}</>;
}
