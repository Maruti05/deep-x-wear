"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useModal } from "@/app/context/ModalContext";
import { toast } from "sonner";
import { supabase } from "../admin/ProductForm";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { AuthResponse } from "@/app/types/Auth";
import { useGlobalLoading } from "../common/LoadingProvider";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPopup({ onClose }: { onClose: () => void }) {
  const { show, hide } = useGlobalLoading();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });
  const { openModal, closeModal } = useModal();
  const router = useRouter(); // for redirection after login
  const pathname = usePathname(); // e.g. /dashboard
  const searchParams = useSearchParams(); // ?query=value
  const { login } = useAuth();
  const handleRefresh = () => {
    const currentUrl = `${pathname}?${searchParams.toString()}`;
    router.push(currentUrl);
  };

  async function onSubmit(data: LoginFormValues) {
    console.log("Login data:", data);
    try {
      show();
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        console.error("Login error:", error);
        throw new Error("Invalid email or password");
      }
    
      const session = authData.session;
      console.log("Session data:", session);

      if (!session) {
        throw new Error("Session not returned from Supabase");
      }

      // Optionally: Fetch additional user details if needed
      // const { user } = session;
      // const userId = user.id;
      login(authData); // This will update context and sessionStorage
      toast.success("Logged in successfully!");

      // Optional: Navigate to dashboard or home page
      handleRefresh();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to log in");
    } finally {
      closeModal(); // If you're using a modal
      hide(); // Hide loading state
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Login
          </Button>
        </form>

        {/* Create Account Link */}
        <p className="text-sm text-center mt-4">
          Don’t have an account?{" "}
          <button
            type="button"
            onClick={() => openModal("signup")}
            className="text-primary underline underline-offset-4 hover:opacity-80"
          >
            Create Account
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
}
