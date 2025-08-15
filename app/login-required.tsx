"use client";
// pages/login-required.tsx
import { useModal } from "@/app/context/ModalContext";
import { useEffect } from "react";


export default function LoginRequiredPage() {
  const { openModal } = useModal();

  useEffect(() => {
    openModal("login");
  }, [openModal]);

  return null; // No page content, just opens modal
}
