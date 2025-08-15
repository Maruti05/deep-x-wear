"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import ColorFullAvatar from "@/components/common/ColorFullAvatar";


// ✅ Schema with all required fields
const profileSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email"),
  phone_number: z.string().min(10, "Phone number must be at least 10 digits"),
  user_address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state_name: z.string().min(1, "State is required"),
  pin_code: z.coerce.number().refine((val) => val > 0, {
    message: "Pin code is required",
  }),
  country: z.string().min(1, "Country is required"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Page() {
  const { user: authUser } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState("/default-avatar.png");

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: authUser?.displayName || "",
      email: authUser?.email || "",
      phone_number: "",
      user_address: "",
      city: "",
      state_name: "",
      pin_code: undefined,
      country: "India",
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    console.log("Saved data:", data);
    toast.success("Profile saved successfully!");
  };

  return (
    <div className="flex justify-center p-4">
      <Card className="w-full max-w-4xl">
        {/* Avatar Section */}
        <CardHeader className="flex flex-col items-center">
          {authUser&&<ColorFullAvatar
            email={authUser?.email}
            name={authUser?.displayName}
            size="h-24 w-24"
          />}
          {/* <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => alert("Upload avatar logic here")}
          >
            Change Avatar
          </Button> */}
        </CardHeader>

        <Separator />

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Details */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Personal Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="mb-2 block">Full Name</Label>
                  <Input {...form.register("full_name")} disabled/>
                  {form.formState.errors.full_name && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.full_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="mb-2 block">Email</Label>
                  <Input type="email" {...form.register("email")} disabled />
                  {form.formState.errors.email && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="mb-2 block">Phone Number</Label>
                  <div className="flex">
                    <span className="flex items-center gap-1 px-3 bg-gray-100 border border-r-0 rounded-l-md text-sm">
                      <span className="text-lg">🇮🇳</span> +91
                    </span>
                    <Input
                      className="rounded-l-none"
                      {...form.register("phone_number")}
                      placeholder="Enter phone number"
                    />
                  </div>
                  {form.formState.errors.phone_number && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.phone_number.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Shipping Details */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Shipping Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="mb-2 block">Address</Label>
                  <Input {...form.register("user_address")} />
                  {form.formState.errors.user_address && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.user_address.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="mb-2 block">City</Label>
                  <Input {...form.register("city")} />
                  {form.formState.errors.city && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.city.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="mb-2 block">State</Label>
                  <Input {...form.register("state_name")} />
                  {form.formState.errors.state_name && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.state_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="mb-2 block">Pin Code</Label>
                  <Input type="number" {...form.register("pin_code")} />
                  {form.formState.errors.pin_code && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.pin_code.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="mb-2 block">Country</Label>
                  <Input {...form.register("country")} disabled />
                  {form.formState.errors.country && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.country.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button type="submit" className="w-full md:w-auto">
                Save Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
