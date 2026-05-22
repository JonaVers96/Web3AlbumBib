import type { Entity } from "./common";

export type Role = "admin" | "user";

export interface PublicUser extends Entity {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}
export interface AuthResponse {
  token: string;
  user: PublicUser;
}
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
