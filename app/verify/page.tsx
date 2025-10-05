"use client"; // 👈 Mark this as a Client Component

import { useEffect } from "react";
import { useRouter } from "next/navigation"; // ✅ App Router
import { supabase } from "@/components/admin/ProductForm";
import { LoaderCircle } from "lucide-react";
export default function VerifyPage() {
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (session) {
        router.push("/");
      } else {
        console.error("Verification failed", error);
      }
    };

    handleRedirect();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center flex flex-col items-center gap-4">
        <LoaderCircle className="animate-spin h-8 w-8 text-primary" />
        <p className="text-lg text-gray-700 font-medium">
          Verifying your email, please wait...
        </p>
      </div>
    </div>
  );
}
