const Role = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type RoleValue = (typeof Role)[keyof typeof Role];

export default Role;