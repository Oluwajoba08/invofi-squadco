/**
 * Global User Types
 */
export type UserType = 'institution' | 'vendor' | 'individual' | 'admin';
export type VerificationStatus = 'pending' | 'trusted' | 'blocked' | 'verified';

/**
 * Auth Namespace for Request Payloads
 */
export namespace AuthRequest {
  export interface Login {
    email: string;
    password: string;
    userType: UserType;
  }

  export interface AdminRegister extends Login {
    name: string;
    setupToken: string;
    role: 'admin';
  }

  export interface CreateVendor {
    companyName: string;
    rcNumber: string;
    directorBvn: string;
    bankAccount: string;
    bankCode: string;
    address: string;
    registrationDate: string;
    contactEmail: string;
  }

  export interface CreateIndividual {
    fullName: string;
    email: string;
    password: string;
    bvn: string;
    nin: string;
    bankAccount: string;
    bankCode: string;
    phoneNumber: string;
    dateOfBirth: string; // Format: DD/MM/YYYY
  }

  export interface CreateInstitution {
    firstName: string;
    lastName: string;
    businessName: string;
    email: string;
    password: string;
    rcNumber: string;
    phoneNumber: string;
    address: string;
  }

  export interface CreateWallet {
    ownerId: string;
    ownerType: 'institution' | 'individual';
    bvn: string;
    gender: 'male' | 'female';
    address: string;
    accountNumber: string;
  }

  export interface CreateVerificationReq {
    institutionId: string;
    vendorEmail?: string;
    vendorPhone?: string;
    paymentAmount: number;
    paymentDescription: string;
  }

  export interface RegisterGuest extends CreateVendor {
    guestToken: string;
    password: string;
    phoneNumber: string;
  }
}

/**
 * Data Models / Response Objects
 */
export interface AuthResponse {
  token: string;
  userType: UserType;
}

export interface Vendor extends AuthRequest.CreateVendor {
  _id: string;
  status: VerificationStatus;
  vScore?: number;
  createdAt: string;
}

export interface Individual {
  _id: string;
  fullName: string;
  email: string;
  bvn: string;
  nin: string;
  phoneNumber: string;
  vScore: number;
}

export interface Institution {
  _id: string;
  businessName: string;
  email: string;
  rcNumber: string;
  phoneNumber: string;
}

export interface Verification {
  _id: string;
  vendorId: string;
  documentUrl: string;
  status: VerificationStatus;
  score: number;
  reason?: string;
  createdAt: string;
}

export interface VerificationRequest {
  _id: string;
  requestId: string; // e.g., VP-REQ-A9ABCF6F
  institutionId: string;
  vendorEmail: string;
  paymentAmount: number;
  paymentDescription: string;
  status: 'pending' | 'joined' | 'submitted' | 'completed';
}

export interface Wallet {
  _id: string;
  ownerId: string;
  balance: number;
  accountNumber: string;
  bankName: string;
  bvn: string;
}

export interface Bank {
  name: string;
  code: string;
}

export interface PaymentStatus {
  status: 'pending' | 'success' | 'failed';
  verificationId: string;
  amount: number;
  txRef?: string;
}