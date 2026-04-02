export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface VerifyOtpInput {
  email: string;
  code: string;
  purpose: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' | 'LOGIN';
}

export interface RequestOtpInput {
  email: string;
  purpose: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' | 'LOGIN';
}
