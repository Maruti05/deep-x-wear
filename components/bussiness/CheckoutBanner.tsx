"use client";

import Link from "next/link";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info, AlertCircle, CheckCircle, LucideIcon } from "lucide-react";

interface ProfileCompletionBannerProps {
  title?: string;
  description?: string;
  linkHref?: string;
  linkText?: string;
  icon?: LucideIcon;
  variant?: "info" | "warning" | "success" | "error";
  onClick?: () => void;
}

const variantStyles = {
  info: {
    border: "border-blue-400/50",
    text: "text-blue-700 dark:text-blue-400",
    iconColor: "text-blue-700 dark:text-blue-400",
    defaultIcon: Info,
  },
  warning: {
    border: "border-yellow-400/50",
    text: "text-yellow-700 dark:text-yellow-400",
    iconColor: "text-yellow-700 dark:text-yellow-400",
    defaultIcon: Info,
  },
  success: {
    border: "border-green-400/50",
    text: "text-green-700 dark:text-green-400",
    iconColor: "text-green-700 dark:text-green-400",
    defaultIcon: CheckCircle,
  },
  error: {
    border: "border-red-400/50",
    text: "text-red-700 dark:text-red-400",
    iconColor: "text-red-700 dark:text-red-400",
    defaultIcon: AlertCircle,
  },
};

export default function Banner({
  title = "Incomplete Profile",
  description = "Please update your profile details to proceed.",
  linkHref = "/profile",
  linkText = "Go to Profile",
  variant = "warning",
  icon,
  onClick,
}: ProfileCompletionBannerProps) {
  const styles = variantStyles[variant];
  const IconComponent = icon || styles.defaultIcon;

  const ActionComponent = () =>
    onClick ? (
      <button
        onClick={onClick}
        className="underline font-medium text-blue-700 dark:text-blue-400"
      >
        {linkText}
      </button>
    ) : (
      <Link
        href={linkHref}
        className="underline font-medium text-blue-700 dark:text-blue-400"
      >
        {linkText}
      </Link>
    );

  return (
    <Alert className={`flex mt-4 items-start gap-2 ${styles.border} ${styles.text}`}>
      <IconComponent className={`h-4 w-4 mt-0.5 ${styles.iconColor}`} />
      <div>
        <AlertTitle className="font-semibold text-sm">{title}</AlertTitle>
        <AlertDescription className="text-xs">
          {description} <ActionComponent />
        </AlertDescription>
      </div>
    </Alert>
  );
}
