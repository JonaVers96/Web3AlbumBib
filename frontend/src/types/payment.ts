import type { Entity } from "./common";

export type PaymentStatus =
  | "created"
  | "open"
  | "paid"
  | "failed"
  | "canceled"
  | "expired";

export interface PaymentItem {
  albumId: number;
  title: string;
  artistName: string;
  priceCents: number;
  coverImageUrl: string | null;
}

export interface Payment extends Entity {
  reference: string;
  status: PaymentStatus;
  amountCents: number;
  checkoutUrl: string | null;
  items: PaymentItem[];
  createdAt: string;
  updatedAt: string;
}
