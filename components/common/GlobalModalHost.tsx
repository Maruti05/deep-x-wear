"use client";

import { useModal } from "@/app/context/ModalContext";
import { LoginPopup } from "../bussiness/LoginPopup";
import SignupForm from "../bussiness/SignupForm";
import PaymentPage from "@/app/payment/page";
import ConfirmPayment from "../bussiness/ConfirmPayment";

export function GlobalModalHost() {
  const { modal, closeModal,modalProps } = useModal();

  return (
    <>
      {modal === "login" && <LoginPopup onClose={closeModal} />}
      {modal === "signup" && <SignupForm onClose={closeModal} />}
      {/* {modal === "payment-confirm" && <PaymentPage onClose={closeModal} />} */}
       {modal === "payment-confirm" && (
        <ConfirmPayment order={modalProps?.order} />
      )}
    </>
  );
}
