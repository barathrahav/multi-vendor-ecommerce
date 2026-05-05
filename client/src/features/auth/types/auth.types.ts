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

export interface RequestOtpRegisterResponse {
  requestOtpRegister: string;
}

export interface RequestOtpRegisterVariables {
  phone: string;
}

export interface VerifyOtpRegisterResponse {
  verifyOtpRegister: {
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

export interface VerifyOtpRegisterVariables {
  name: string;
  email: string;
  password: string;
  phone: string;
  code: string;
  role?: string;
}

