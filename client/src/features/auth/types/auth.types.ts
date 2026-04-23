export interface LoginResponse {
  login: {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
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
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  };
}

export interface RegisterVariables {
  name: string;
  email: string;
  password: string;
  role?: string;
}

