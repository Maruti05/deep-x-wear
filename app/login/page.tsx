"use client";
import React, { useEffect } from 'react'
import { useModal } from '../context/ModalContext'

const page = () => {
const { openModal } = useModal();

  useEffect(() => {
    openModal("login");
  }, [openModal]);

  return null; 
}

export default page
