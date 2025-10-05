"use client";

import * as React from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  LogIn,
  LogOut,
  User,
  Settings,
  ShoppingCart,
  Package,
} from "lucide-react";
import { ModeToggle } from "../ModeToggle";
import { useRouter } from "next/navigation";
import { Dialog, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { DialogContent } from "@radix-ui/react-dialog";
import { LoginPopup } from "../bussiness/LoginPopup";
import { useModal } from "@/app/context/ModalContext";
import { useCart } from "@/app/context/CartContext";
import { Badge } from "../ui/badge";
import { useAuth } from "@/app/context/AuthContext";
import ColorFullAvatar from "./ColorFullAvatar";
import ProductSearch from "../bussiness/ProductSearch";
import Image from "next/image";
import { BrandLogo } from "./BrandLogo";

export interface NavItem {
  name: string;
  url: string;
}

export interface HeaderProps {
  navItems?: NavItem[];
  isLoggedIn?: boolean;
  user?: {
    name: string;
    email: string;
    avatarUrl?: string;
  } | null;
  onLogin?: () => void;
  onRegister?: () => void;
  onLogout?: () => void;
}

const defaultNav: NavItem[] = [
  // { name: "Home", url: "/" },
  // { name: "About", url: "/about" },
  // { name: "Contact", url: "/contact" },
];
const APP_NAME = "Deep-Xwear";
export const Header: React.FC<HeaderProps> = ({
  navItems = defaultNav,
  isLoggedIn = true,
  user,
  onLogin,
  onRegister,
  onLogout,
}) => {
  const { cart } = useCart();

  const totalItems = cart.length;
  const { openModal } = useModal();
  const { accessToken, user: authUser, logout } = useAuth();

  const isAuthenticated = authUser?.isLoginnedIn;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo / Brand */}
        <Link href="/" className="text-xl font-bold tracking-tight">
          <BrandLogo/>
        </Link>
        <div className="flex-1 max-w-lg hidden md:block">
          <ProductSearch />
        </div>
        {/* Desktop nav */}
        <nav className="hidden gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.url}
              href={item.url}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <div className="block md:hidden">
            <ProductSearch />
          </div>
          <ModeToggle />
          {totalItems > 0 && (
            <Link href="/cart">
              <Button variant="outline" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge
                    className="absolute -top-2 -right-2 rounded-full px-2 py-0.5 text-xs"
                    variant="secondary"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>
          )}
          {isAuthenticated && authUser ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  {authUser && (
                    <ColorFullAvatar
                      email={authUser?.email}
                      name={authUser?.displayName}
                    />
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {authUser.displayName || authUser.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {authUser.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/order-history"
                      className="flex items-center gap-2"
                    >
                      <Package className="h-4 w-4" />
                      Your Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className={cn(buttonVariants({ variant: "outline" }))}
                onClick={() => openModal("signup")}
              >
                Signup
              </Button>

              <Button size="sm" onClick={() => openModal("login")}>
                Login
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
