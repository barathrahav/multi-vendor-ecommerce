export type AdminUserRole = "ADMIN" | "VENDOR" | "CUSTOMER";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
}

export interface UsersResponse {
  users: AdminUser[];
}

export interface AdminCreateUserResponse {
  adminCreateUser: AdminUser;
}

export interface AdminUpdateUserResponse {
  adminUpdateUser: AdminUser;
}

export interface AdminUpdateUserPasswordResponse {
  adminUpdateUserPassword: {
    id: string;
  };
}

export interface AdminDeleteUserResponse {
  adminDeleteUser: string;
}

export interface AdminCreateUserVariables {
  name: string;
  email: string;
  password: string;
  role: AdminUserRole;
}

export interface AdminUpdateUserVariables {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
}

export interface AdminUpdateUserPasswordVariables {
  id: string;
  password: string;
}

export interface AdminDeleteUserVariables {
  id: string;
}
