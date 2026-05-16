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
  Bank,
  InstitutionDashboardData,
  IndividualDashboardData,
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
      apiClient<{ success: boolean; data: Individual }>(`/individuals/${id}`),

    getDashboard: () =>
      apiClient<{ success: boolean; data: IndividualDashboardData }>('/individuals/dashboard'),

    verify: (formData: FormData, individualId: string) =>
      apiClient<any>(`/individuals/${individualId}/verify`, { data: formData }),
  },

  // --- INSTITUTIONS ---
  institutions: {
    create: (data: AuthRequest.CreateInstitution) =>
      apiClient<Institution>('/institutions', { data }),

    getDetails: (id: string) =>
      apiClient<{ success: boolean; data: Institution }>(`/institutions/${id}`),

    update: (id: string, data: Partial<AuthRequest.CreateInstitution>) =>
      apiClient<{ success: boolean; data: Institution }>(`/institutions/${id}`, { method: 'PATCH', data }),

    getRequests: (id: string) =>
      apiClient<VerificationRequest[]>(`/institutions/${id}/requests`),

    getDashboard: () =>
      apiClient<{ success: boolean; data: InstitutionDashboardData }>('/institutions/dashboard'),
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

    getAll: (params?: { page?: number; limit?: number; status?: string }) =>
      apiClient<any>('/verification-requests', { params }),

    getAVerificationRequest: (requestCode: string) =>
      apiClient<any>(`/verification-requests/${requestCode}`),

    approveRequest: (requestCode: string) =>
      apiClient<any>(`/verification-requests/${requestCode}/approve`, { method: 'PATCH' }),
  },

  // --- GUEST VENDOR FLOW ---
  guest: {
    getRequest: (reqId: string) =>
      apiClient<{ success: boolean; data: VerificationRequest }>(`/verification-requests/guest/${reqId}`),

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

    getByOwner: (ownerId: string, ownerType: string) =>
      apiClient<any>(`/wallets/owner/${ownerId}?ownerType=${ownerType}`),

    getBanks: () =>
      apiClient<{ success: boolean; data: Bank[] }>('/payments/banks'),

    simulateFunding: (data: { accountNumber: string; amount: number }) =>
      apiClient<any>('/wallets/simulate-funding', { method: 'POST', data }),
  },

  payments: {
    release: (verificationId: string) =>
      apiClient<any>('/payments/release', { data: { verificationId } }),

    getVendorPayments: (vendorId: string) =>
      apiClient<any[]>(`/payments/vendor/${vendorId}`),

    getStatus: (verificationId: string) =>
      apiClient<{ status: string }>(`/payments/status/${verificationId}`),

    verifyPayment: (data: { verificationId: string; document: File }) => {
      const formData = new FormData();
      formData.append('verificationId', data.verificationId);
      formData.append('document', data.document);
      return apiClient<any>('/payments/verify-payment', {
        method: 'POST',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },

    analyseScreenshot: (data: { amount: number; document: File; senderName?: string; date?: string }) => {
      const formData = new FormData();
      formData.append('amount', data.amount.toString());
      formData.append('document', data.document);
      if (data.senderName) formData.append('senderName', data.senderName);
      if (data.date) formData.append('date', data.date);
      return apiClient<any>('/payments/analyse-screenshot', {
        method: 'POST',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
  },

  sessions: {
    create: (data: { initiatorProfileId: string; recipientEmail?: string; recipientPhone?: string; amount: number; description: string }) =>
      apiClient<{ success: boolean; data: any }>('/sessions', { method: 'POST', data }),

    getStatus: (sessionCode: string, params?: { profileId?: string; guestToken?: string }) =>
      apiClient<{ success: boolean; data: any }>(`/sessions/${sessionCode}/status`, { params }),

    getDetails: (sessionCode: string) =>
      apiClient<{ success: boolean; data: any }>(`/sessions/${sessionCode}/details`),

    joinGuest: (sessionCode: string, data: { fullName: string; phoneNumber: string }) =>
      apiClient<{ success: boolean; data: { guestToken: string } }>(`/sessions/${sessionCode}/join-guest`, { method: 'POST', data }),

    submitVerificationGuest: (sessionCode: string, formData: FormData) =>
      apiClient<{ success: boolean; data: any }>(`/sessions/${sessionCode}/verify-guest`, { method: 'POST', data: formData }),

    giveConsent: (sessionCode: string, profileId: string) =>
      apiClient<{ success: boolean; data: any }>(`/sessions/${sessionCode}/consent`, { method: 'POST', data: { profileId } }),

    giveConsentAsGuest: (sessionCode: string, guestToken: string) =>
      apiClient<{ success: boolean; data: any }>(`/sessions/${sessionCode}/consent-guest`, { method: 'POST', data: { guestToken } }),
  },

  auditLogs: {
    getAll: (params?: { page?: number; limit?: number; action?: string }) =>
      apiClient<any>('/audit-logs', { params }),
  },
};
