"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2, LocateFixed } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateUser } from "@/hooks/useCreateUser";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useModal } from "@/app/context/ModalContext";
import { ScrollArea } from "../ui/scroll-area";
import { toast } from "sonner";
import { fi } from "zod/v4/locales";
import { supabase } from "../admin/ProductForm";
import { showToast } from "@/lib/sweetalert-theme";
import { useGlobalLoading } from "../common/LoadingProvider";
import { useUserDetails } from "@/hooks/useUserDetails";
/* -------------------------------------------------- */
const signupSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email"),
  // phone_number: z.string().max(10, "Phone number must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 chars"),
  // user_address: z.string().min(1, "Address is required"),
  // city: z.string().min(1, "City is required"),
  // state_name: z.string().min(1, "State is required"),
  // pin_code: z.string().min(6, "Pin code must be at least 6 digits"),
  // country: z.string().min(1, "Country is required"),
  // map_location: z.object({
});

export type SignupFormValues = z.infer<typeof signupSchema>;

/* -------------------------------------------------- */
export default function SignupForm({ onClose }: { onClose: () => void }) {
  const { show, hide } = useGlobalLoading();
  const [mapLocation, setMapLocation] = React.useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
  });
  const { openModal, closeModal } = useModal();
  // const { mutate, isLoading, isError, error } = useCreateUser();
  const { user, isLoading, error,isError, insertUser, updateUser } = useUserDetails();
  /* ---------- Get geolocation ---------- */
  const fetchLocation = () => {
    if (!navigator.geolocation)
      return console.error("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMapLocation({ latitude, longitude });
      },
      (err) => console.error("Location error", err)
    );
  };

  /* ---------- Submit ---------- */
  async function onSubmit(data: SignupFormValues) {
    try {
      // Sign up using Supabase Auth
      show();
      const { data: authResult, error: authError } = await supabase.auth.signUp(
        {
          email: data.email,
          password: data.password,
          options: {
            // emailRedirectTo: "http://localhost:3000/verify",
            data: {
              display_name: data.full_name,
              //phone_number: data.phone_number, // Assuming phone number is in Indian format
            },
          },
        }
      );

      if (authError) {
        console.error("Auth error:", authError);
        throw authError;
      }

      const user_id = authResult.user?.id;
      console.log(authResult);
      
      if (!user_id) throw new Error("No user ID returned from Supabase");
      // mutate({
      //   userDetails: {
      //     full_name: data.full_name,
      //     email: data.email,
      //     phone_number: data.phone_number, // Assuming phone number is in Indian format
      //     user_id,
      //     role: "USER",
      //   },
      // });
       insertUser({
        user_id,
        full_name: data.full_name,
        email: data.email,
        role: "USER",
      });
      
      if (error) {
        console.error("Insert error:", error);
        throw error;
      }
      toast.success("Account created successfully!",{
        description: "Please check your email to verify your account.",
      });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create account");
    } finally {
      closeModal();
      hide();
    }
  }

  /* -------------------------------------------------- */
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Sign Up</DialogTitle>
        </DialogHeader>
        {isError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {(error as any)?.response?.data?.error ??
                "An unexpected error occurred."}
            </AlertDescription>
          </Alert>
        )}
        <ScrollArea className="h-85 w-full rounded-md">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* User details */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" {...register("full_name")} />
                {errors.full_name && (
                  <p className="text-sm text-red-600">
                    {errors.full_name.message}
                  </p>
                )}
              </div>
              <div className="grid  gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input type="email" id="email" {...register("email")} />
                  {errors.email && (
                    <p className="text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                {/* <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" {...register("phone_number")} />
                  {errors.phone_number && (
                    <p className="text-sm text-red-600">
                      {errors.phone_number.message}
                    </p>
                  )}
                </div> */}
              </div>
              {/* <Button
              variant="secondary"
              type="button"
              onClick={fetchLocation}
              className="flex items-center gap-2"
            >
              <LocateFixed className="h-4 w-4" /> Get Current Location
            </Button>
            {mapLocation && (
              <p className="text-xs text-muted-foreground">Location: {JSON.stringify(mapLocation)}</p>
            )} */}
            </div>

            <Separator />

            {/* Password */}
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input type="password" id="password" {...register("password")} />
              {errors.password && (
                <p className="text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="w-full mt-2"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign Up
            </Button>
          </form>
        </ScrollArea>
        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => openModal("login")}
            className="text-primary underline underline-offset-4 hover:opacity-80"
          >
            Log in here
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
}
