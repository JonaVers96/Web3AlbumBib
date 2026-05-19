import type { AuthResponse, PublicUser, Role } from "../types/user";
import { apiFetch } from "./client";

export const login = (email: string, password: string) =>
  apiFetch<AuthResponse>(`/sessions`, {
    method: "POST",
    auth: false,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

export const register = (body: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) =>
  apiFetch<AuthResponse>(`/users`, {
    method: "POST",
    auth: false,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const me = () => apiFetch<PublicUser>(`/users/me`, { auth: true });

export const fetchUsers = () =>
  apiFetch<{ items: PublicUser[] }>(`/users`, { auth: true });

export const updateUserRole = (id: number, role: Role) =>
  apiFetch<PublicUser>(`/users/${id}/role`, {
    method: "PUT",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });

export const deleteUser = (id: number) =>
  apiFetch<void>(`/users/${id}`, { method: "DELETE", auth: true });
