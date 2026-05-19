import type { Payment } from "../types/payment";
import { apiFetch } from "./client";

export const createCheckout = (albumIds: number[]) =>
  apiFetch<{ reference: string; checkoutUrl: string }>(`/payments/checkout`, {
    method: "POST",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ albumIds }),
  });

export const getPayment = (reference: string) =>
  apiFetch<Payment>(`/payments/${reference}`, { auth: true });

export const syncPayment = (reference: string) =>
  apiFetch<Payment>(`/payments/${reference}/sync`, { auth: true });
