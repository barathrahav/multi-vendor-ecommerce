export interface LoginResponse {
  login: {
    token: string;
    refreshToken: string;
    user: {
      id: string;
      name: string;
      email: string;
      phone?: string | null;
      role: string;
    };
  };
}

export interface LoginVariables {
  email: string;
  password: string;
}

export interface RegisterResponse {
  register: {
    token: string;
    refreshToken: string;
    user: {
      id: string;
      name: string;
      email: string;
      phone?: string | null;
      role: string;
    };
  };
}

export interface RegisterVariables {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}

