"use client";

import Link from "next/link";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function ProfileCompletionBanner({ authUser }: { authUser: any }) {
  const verifyRequireFieldsPresent = () => {
    if (!authUser?.additionalData) return false;

    const requiredFields: (keyof typeof authUser.additionalData)[] = [
      "phone_number",
      "pin_code",
      "state_name",
      "user_address",
      "city",
    ];

    return requiredFields.every(
      (field) => !!authUser.additionalData?.[field]
    );
  };

  const isProfileComplete = verifyRequireFieldsPresent();

  if (isProfileComplete) return null;

  return (
    <Alert
    className="flex items-start gap-2 border-yellow-400/50 text-yellow-700 dark:border-yellow-400 dark:text-yellow-400"
>
    <Info className="h-4 w-4 mt-0.5 text-yellow-700 dark:text-yellow-400" />
    <div>
        <AlertTitle className="font-semibold text-sm">Incomplete Profile</AlertTitle>
        <AlertDescription className="text-xs">
            Please update your profile details to proceed with ordering.{" "}
            <Link
                href="/profile"
                className="underline font-medium text-red-700 dark:text-red-400"
            >
                Go to Profile
            </Link>
        </AlertDescription>
    </div>
</Alert>
  );
}