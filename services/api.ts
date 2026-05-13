import { apiClient } from '@/utils/apiClient';
import { 
  AuthRequest, 
  AuthResponse, 
  Vendor, 
  Individual, 
  Institution, 
  Verification, 
  VerificationRequest, 
  Wallet, 
  Bank 
} from './types';

export const ApiService = {
  // --- AUTHENTICATION ---
  auth: {
    registerAdmin: (data: AuthRequest.AdminRegister) =>
      apiClient<AuthResponse>('/auth/register', { data }),

    login: (data: AuthRequest.Login) =>
      apiClient<AuthResponse>('/auth/login', { data }),
  },

  // --- VENDORS ---
  vendors: {
    create: (data: AuthRequest.CreateVendor) =>
      apiClient<Vendor>('/vendors', { data }),

    // Matches http://localhost:9097/api/vendors?id=...
    getOne: (id: string) =>
      apiClient<Vendor>('/vendors', { params: { id } }),

    getAll: () =>
      apiClient<Vendor[]>('/vendors'),

    updateStatus: (id: string, status: 'trusted' | 'blocked', reason: string) =>
      apiClient<Vendor>(`/vendors/${id}/status`, { 
        method: 'PATCH', 
        data: { status, reason } 
      }),

    delete: (id: string) =>
      apiClient<void>(`/vendors/${id}/status`, { method: 'DELETE' }),
  },

  // --- INDIVIDUALS ---
  individuals: {
    create: (data: AuthRequest.CreateIndividual) =>
      apiClient<Individual>('/individuals', { data }),

    getDetails: (id: string) =>
      apiClient<Individual>(`/individuals/${id}`),
  },

  // --- INSTITUTIONS ---
  institutions: {
    create: (data: AuthRequest.CreateInstitution) =>
      apiClient<Institution>('/institutions', { data }),

    getDetails: (id: string) =>
      apiClient<Institution>(`/institutions/${id}`),

    // Documentation shows /institutions/:id/requests twice
    getRequests: (id: string) =>
      apiClient<VerificationRequest[]>(`/institutions/${id}/requests`),
  },

  // --- VERIFICATIONS ---
  verifications: {
    // Uses form-data for the 'document' and 'vendorId' fields
    verifyDocument: (formData: FormData) =>
      apiClient<Verification>('/verifications', { data: formData }),

    getDetails: (id: string) =>
      apiClient<Verification>(`/verifications/${id}`),

    createRequest: (data: AuthRequest.CreateVerificationReq) =>
      apiClient<VerificationRequest>('/verification-requests', { data }),
  },

  // --- GUEST VENDOR FLOW ---
  guest: {
    getRequest: (reqId: string) =>
      apiClient<VerificationRequest>(`/verification-requests/guest/${reqId}`),

    joinRequest: (reqId: string, data: { fullName: string; phoneNumber: string }) =>
      apiClient<{ guestToken: string }>(`/verification-requests/guest/${reqId}/join`, { data }),

    // form-data: guestToken, bvn, bankAccount, etc.
    submitDocument: (reqId: string, formData: FormData) =>
      apiClient<any>(`/verification-requests/guest/${reqId}/submit`, { data: formData }),

    register: (reqId: string, data: AuthRequest.RegisterGuest) =>
      apiClient<Vendor>(`/verification-requests/guest/${reqId}/convert`, { data }),
  },

  // --- WALLET & PAYMENTS ---
  wallet: {
    create: (data: AuthRequest.CreateWallet) =>
      apiClient<Wallet>('/wallets', { data }),

    getDetails: (walletId: string) =>
      apiClient<Wallet>(`/wallets/${walletId}`),

    getBanks: () =>
      apiClient<Bank[]>('/payments/banks'),
  },

  payments: {
    release: (verificationId: string) =>
      apiClient<void>('/payments/release', { data: { verificationId } }),

    getVendorPayments: (vendorId: string) =>
      apiClient<any[]>(`/payments/vendor/${vendorId}`),

    getStatus: (verificationId: string) =>
      apiClient<{ status: string }>(`/payments/status/${verificationId}`),
  },
};