"use client";

import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { indianStates } from "../constant";
import { useUserDetails } from "@/hooks/useUserDetails";
import { useGlobalLoading } from "@/components/common/LoadingProvider";
import { verifyRequiredFieldsPresent } from "@/lib/utils";
import { AdditionalData } from "../types/User";

// ✅ Schema with all required fields
const profileSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email"),
  phone_number: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone number"),
  user_address: z.string().min(5, "Address is too short"),
  city: z.string().min(2, "City name is too short"),
  state_name: z.string().min(1, "State is required"),
  pin_code: z
    .string()
    .length(6, "Pin code must be 6 digits")
    .regex(/^\d+$/, "Pin code must contain only numbers"),

  country: z.string().min(1, "Country is required"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Page() {
  const { show, hide } = useGlobalLoading();
  const { user: authUser, login, updateAuth } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState("/default-avatar.png");
  const { user, isLoading, isError, error, getUser, updateUser } =
    useUserDetails();
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: authUser?.displayName || "",
      email: authUser?.email || "",
      phone_number: authUser?.additionalData?.phone_number || "",
      user_address: authUser?.additionalData?.user_address || "",
      city: authUser?.additionalData?.city || "",
      state_name: authUser?.additionalData?.state_name || "Karnataka",
      pin_code: authUser?.additionalData?.pin_code?.toString() || "",
      country: "India",
    },
  });
  useEffect(() => {
    if (authUser) {
      form.reset({
        full_name: authUser.displayName || "",
        email: authUser.email || "",
        phone_number: authUser.additionalData?.phone_number || "",
        user_address: authUser.additionalData?.user_address || "",
        city: authUser.additionalData?.city || "",
        state_name: authUser.additionalData?.state_name || "Karnataka",
        pin_code: authUser.additionalData?.pin_code?.toString() || "",
        country: "India",
      });
    }
  }, [authUser, form]);
  const onSubmit = async (data: ProfileFormData) => {
    try {
      show(); // Show loader
      // Update user
      await updateUser(data);
      // Fetch fresh user details
      const userDetails = await getUser();
      // Update auth context/state
      await updateAuth({...authUser,additionalData: userDetails,isProfileCompleted:verifyRequiredFieldsPresent(userDetails as AdditionalData)});

      toast.success("Profile saved successfully!");
      // Reset form state after success (so Save button disables again)
      // form.reset(data);
    } catch (error: any) {
      console.error("Profile save failed:", error);
      toast.error(
        error?.message || "Failed to save profile. Please try again."
      );
    } finally {
      hide(); // Always hide loader
    }
  };

  return (
    <div className="flex justify-center p-4">
      <Card className="w-full max-w-4xl">
        {/* Avatar Section */}
        <CardHeader className="flex flex-col items-center">
          {authUser && (
            <ColorFullAvatar
              email={authUser?.email}
              name={authUser?.displayName}
              size="h-24 w-24"
            />
          )}
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
                  <Input {...form.register("full_name")} disabled />
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
                    <span className="flex items-center gap-1 px-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 border-r-0 rounded-l-md text-sm">
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
                  <Label htmlFor="state_name">State</Label>
                  <Select
                    defaultValue="Karnataka"
                    onValueChange={(val) => form.setValue("state_name", val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent>
                      {indianStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.state_name && (
                    <p className="text-sm text-red-500">
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
              <Button
                type="submit"
                className="w-full md:w-auto"
                disabled={!form.formState.isDirty}
              >
                Save Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
