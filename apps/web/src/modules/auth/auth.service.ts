import { createApi, methodsEnums } from '@/lib/createApi';
import type {
  User,
  LoginKeys,
  LoginResponse,
  RegisterKeys,
  RegisterResponse,
  VerifyOtpKeys,
  VerifyOtpResponse,
  RequestOtpKeys,
  RequestOtpResponse,
  CompleteProfileKeys,
  CompleteProfileResponse,
  GoogleLoginKeys,
  UpdateUserKeys,
} from './types';

const { GET, POST, PATCH, DELETE } = methodsEnums;

// ─── Auth Service ────────────────────────────────────────────

function registerRequest(data: RegisterKeys) {
  return { url: '/auth/register', method: POST, data };
}

export const register = createApi<RegisterKeys, RegisterResponse>({
  request: registerRequest,
});

function loginRequest(data: LoginKeys) {
  return { url: '/auth/login', method: POST, data };
}

export const login = createApi<LoginKeys, LoginResponse>({
  request: loginRequest,
});

function verifyOtpRequest(data: VerifyOtpKeys) {
  return { url: '/auth/verify-otp', method: POST, data };
}

export const verifyOtp = createApi<VerifyOtpKeys, VerifyOtpResponse>({
  request: verifyOtpRequest,
});

function requestOtpRequest(data: RequestOtpKeys) {
  return { url: '/auth/request-otp', method: POST, data };
}

export const requestOtp = createApi<RequestOtpKeys, RequestOtpResponse>({
  request: requestOtpRequest,
});

function completeProfileRequest(data: CompleteProfileKeys) {
  return { url: '/auth/complete-profile', method: POST, data };
}

export const completeProfile = createApi<CompleteProfileKeys, CompleteProfileResponse>({
  request: completeProfileRequest,
});

function refreshRequest() {
  return { url: '/auth/refresh', method: POST };
}

export const refresh = createApi<void, LoginResponse>({
  request: refreshRequest,
});

function googleLoginRequest(data: GoogleLoginKeys) {
  return { url: '/auth/google', method: POST, data };
}

export const googleLogin = createApi<GoogleLoginKeys, LoginResponse>({
  request: googleLoginRequest,
});

function logoutRequest() {
  return { url: '/auth/logout', method: POST };
}

export const logout = createApi<void, void>({
  request: logoutRequest,
});

// ─── User Service ────────────────────────────────────────────

function getMeRequest() {
  return { url: '/users/me', method: GET };
}

export const getMe = createApi<void, User>({
  request: getMeRequest,
});

function updateMeRequest(data: UpdateUserKeys) {
  return { url: '/users/me', method: PATCH, data };
}

export const updateMe = createApi<UpdateUserKeys, User>({
  request: updateMeRequest,
});

function deleteMeRequest() {
  return { url: '/users/me', method: DELETE };
}

export const deleteMe = createApi<void, void>({
  request: deleteMeRequest,
});
