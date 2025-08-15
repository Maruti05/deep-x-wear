"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

/**
 * Responsive footer built with shadcn/ui + Tailwind.
 * Drop into `app/components/` and include at the bottom of your layout.
 */
export const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-zinc-900 text-zinc-100 py-10 mt-16">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:grid-cols-2 md:grid-cols-4 lg:gap-12">
        {/* About */}
        <div>
          <h3 className="mb-2 text-lg font-semibold">About Us</h3>
          <p className="text-sm text-zinc-400">
            We provide the best products with top‑notch quality and service.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="mb-2 text-lg font-semibold">Quick Links</h3>
          <ul className="space-y-1 text-sm">
            {[
              // { name: "Home", href: "/" },
              // { name: "Products", href: "/products" },
              { name: "Contact", href: "/contact-us" },
              { name: "Privacy Policy", href: "/privacy" },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="mb-2 text-lg font-semibold">Contact Us</h3>
          <p className="text-sm text-zinc-400">Email: support@example.com</p>
          <p className="text-sm text-zinc-400">Phone: +91 98765 43210</p>
          <p className="text-sm text-zinc-400">Location: Mumbai, India</p>
        </div>

        {/* Social */}
        <div className="sm:text-left text-center">
          <h3 className="mb-2 text-lg font-semibold">Follow Us</h3>
          <div className="flex justify-center sm:justify-start gap-3">
            {/* <Button
              size="icon"
              variant="ghost"
              className="rounded-full bg-zinc-800 hover:bg-zinc-700"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full bg-zinc-800 hover:bg-zinc-700"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </Button> */}
            <Link
              href="https://www.instagram.com/deepx_wear_official/?utm_source=qr&r=nametag"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full bg-zinc-800 hover:bg-zinc-700"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Button>
            </Link>
            {/* <Button
              size="icon"
              variant="ghost"
              className="rounded-full bg-zinc-800 hover:bg-zinc-700"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </Button> */}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-10 text-center text-sm text-zinc-500">
        © {year} Your Company. All Rights Reserved.
      </div>
    </footer>
  );
};
