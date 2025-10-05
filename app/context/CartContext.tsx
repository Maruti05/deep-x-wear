"use client"
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartContextType, CartItem } from '../types/CartItem';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCartState] = useState<CartItem[]>([]);

  const addToCart = (newItem: CartItem) => {
    setCartState(prev => {
      const existingIndex = prev.findIndex(
        item =>
          item.productId === newItem.productId &&
          item.color === newItem.color &&
          item.size === newItem.size
      );

      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += newItem.quantity;
        return updated;
      }

      return [...prev, newItem];
    });
  };

  const updateCartItem = (index: number, updatedItem: Partial<CartItem>) => {
    setCartState(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...updatedItem };
      return updated;
    });
  };

  const removeFromCart = (index: number) => {
    setCartState(prev => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCartState([]);
  };

  const setCart = (items: CartItem[]) => {
    setCartState(items);
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateCartItem, removeFromCart, clearCart, setCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
