"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { forwardRef, useMemo } from "react";

const COLORS = [
  "bg-red-500 text-white",
  "bg-green-500 text-white",
  "bg-blue-500 text-white",
  "bg-yellow-500 text-black",
  "bg-purple-500 text-white",
  "bg-pink-500 text-white",
  "bg-indigo-500 text-white",
  "bg-orange-500 text-white",
  "bg-cyan-500 text-black",
  "bg-teal-500 text-white",
];

interface ColorFullAvatarProps extends  Omit<React.ComponentPropsWithoutRef<"button">, "name"> {
  avatarUrl?: string | null;
  name?: string | null;
  email?: string | null;
  size?: string;
}

const ColorFullAvatar = forwardRef<HTMLButtonElement, ColorFullAvatarProps>(
  ({ avatarUrl, name, email, size = "h-9 w-9", className = "", ...props }, ref) => {
    const initials = useMemo(() => {
      const text = name || email || "??";
      return text.slice(0, 2).toUpperCase();
    }, [name, email]);

    const randomColor = useMemo(() => {
      const seed = (name || email || "default").charCodeAt(0);
      return COLORS[seed % COLORS.length];
    }, [name, email]);

    return (
      <button
        ref={ref}
        type="button"
        role="button"
        tabIndex={0}
        className={`p-0 border-none bg-transparent`}
        {...props}
      >
        <Avatar className={`cursor-pointe ${size} ${className}`}>
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={name || email || "Avatar"} />
          ) : (
            <AvatarFallback className={`${randomColor} font-semibold`}>
              {initials}
            </AvatarFallback>
          )}
        </Avatar>
      </button>
    );
  }
);

ColorFullAvatar.displayName = "ColorFullAvatar";

export default ColorFullAvatar;
