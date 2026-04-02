export interface JwtPayload {
  sub: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export type OtpPurpose = 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' | 'LOGIN';
