"use client";

import React, { createContext, useContext, useState } from "react";

type ModalName = "login" | "signup" | null;

interface ModalContextType {
  modal: ModalName;
  openModal: (name: ModalName) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<ModalName>(null);

  const openModal = (name: ModalName) => setModal(name);
  const closeModal = () => setModal(null);

  return (
    <ModalContext.Provider value={{ modal, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useModal must be used within ModalProvider");
  return context;
};
