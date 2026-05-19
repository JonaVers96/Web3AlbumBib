import React, { createContext, useContext, useMemo, useState } from "react";
import type { Album } from "../types/album";

type CartContextValue = {
  items: Album[];
  count: number;
  totalCents: number;
  add: (album: Album) => void;
  remove: (albumId: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<Album[]>([]);

  const add = (album: Album) => {
    setItems((prev) => (prev.some((a) => a.id === album.id) ? prev : [...prev, album]));
  };

  const remove = (albumId: number) => {
    setItems((prev) => prev.filter((a) => a.id !== albumId));
  };

  const clear = () => setItems([]);

  const totalCents = useMemo(() => items.reduce((sum, a) => sum + a.priceCents, 0), [items]);
  const count = items.length;

  const value = useMemo<CartContextValue>(
    () => ({ items, count, totalCents, add, remove, clear }),
    [items, count, totalCents]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
