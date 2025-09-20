"use client";

import React, { createContext, useContext, useState } from "react";

type ModalName = "login" | "signup" | "payment-confirm" | null;

interface ModalContextType {
  modal: ModalName;
  modalProps: any;
  openModal: (name: ModalName, props?: any) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<ModalName>(null);
  const [modalProps, setModalProps] = useState<any>(null);

  const openModal = (name: ModalName, props: any = null) => {
    setModal(name);
    setModalProps(props);
  };

  const closeModal = () => {
    setModal(null);
    setModalProps(null);
  };

  return (
    <ModalContext.Provider value={{ modal, modalProps, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useModal must be used within ModalProvider");
  return context;
};
