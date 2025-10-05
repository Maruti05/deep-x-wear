"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isLoading } = useAuth(); // add isLoading if possible
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // wait until auth finishes loading

    if (!user) {
      router.replace("/login"); // Redirect to login if not authenticated
      return;
    }

    const role = user.additionalData?.role || user.role;

    if (!allowedRoles.includes(role)) {
      router.replace("/403"); // forbidden page
    }
  }, [user, isLoading, router, allowedRoles]);

  if (isLoading) {
    return <p>Loading...</p>; // show a loader while fetching
  }

  if (!user) {
    return null; // Don't render anything if not authenticated
  }

  const role = user.additionalData?.role || user.role;
  
  if (!allowedRoles.includes(role)) {
    return null; // prevent flash of unauthorized content
  }

  return <>{children}</>;
}
