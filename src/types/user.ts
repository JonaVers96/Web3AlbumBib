import type { Entity, ListResponse } from './common';

export type Role = 'admin' | 'user';

export interface User extends Entity {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: Role;
}

export interface PublicUser extends Entity {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}

export interface RegisterUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UpdateUserRequest extends Pick<RegisterUserRequest, 'firstName' | 'lastName' | 'email'> {}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateUserRoleRequest {
  role: Role;
}

export interface GetAllUsersResponse extends ListResponse<PublicUser> {}
export interface GetUserByIdResponse extends PublicUser {}
export interface UpdateUserResponse extends GetUserByIdResponse {}

export interface AuthResponse {
  token: string;
  user: PublicUser;
}

export interface GetUserRequest {
  id: number | 'me';
}
