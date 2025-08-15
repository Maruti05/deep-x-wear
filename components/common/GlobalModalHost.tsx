"use client";

import { useModal } from "@/app/context/ModalContext";
import { LoginPopup } from "../bussiness/LoginPopup";
import SignupForm from "../bussiness/SignupForm";

export function GlobalModalHost() {
  const { modal, closeModal } = useModal();

  return (
    <>
      {modal === "login" && <LoginPopup onClose={closeModal} />}
      {modal === "signup" && <SignupForm onClose={closeModal} />}
    </>
  );
}
