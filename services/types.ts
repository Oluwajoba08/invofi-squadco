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
    // bvn: string;
    // nin: string;
    // bankAccount: string;
    // bankCode: string;
    // phoneNumber: string;
    // dateOfBirth: string; // Format: DD/MM/YYYY
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
    bankCode: string;
    phoneNumber: string;
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

export interface AuthResponse {
  token: string;
  user: any;
  userType: string;
}

export interface Vendor extends AuthRequest.CreateVendor {
  _id: string;
  status: VerificationStatus;
  vScore?: number;
  createdAt: string;
}

export interface Individual {
  _id?: string;
  fullName: string;
  email: string;
  bvn?: string;
  nin?: string;
  phoneNumber?: string;
  vScore?: number;
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
  requestCode: string;
  institutionId?: string;
  institutionName?: string;
  vendorEmail?: string;
  paymentAmount: number;
  paymentDescription: string;
  status: string;
  expiresAt?: string;
  createdAt?: string;
}

export interface Wallet {
  _id: string;
  ownerId: string;
  ownerType: 'institution' | 'individual';
  firstName: string;
  lastName: string;
  email: string;
  bvn: string;
  address: string;
  gender: string;
  bankCode: string;
  accountNumber: string;
  mobileNumber: string;
  settlementAccountNumber: string;
  customerId: string;
  balance: number;
  status: string;
  recentFundings?: any[];
  createdAt: string;
  updatedAt: string;
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
export interface InstitutionDashboardData {
  institution: {
    id: string;
    name: string;
    rcNumber: string;
    email: string;
    unverifiedVendorPolicy: string;
  };
  wallet: {
    internalBalance: number;
    currency: string;
  };
  stats: {
    totalRequests: number;
    trusted: number;
    review: number;
    blocked: number;
    unverified: number;
    expired: number;
    pendingVendorAction: number;
  };
  recentRequests: {
    requestCode: string;
    vendorName: string;
    paymentAmount: number;
    status: string;
    trustScore: number;
    verdict: string;
    createdAt: string;
  }[];
}

export interface IndividualDashboardData {
  profile: {
    fullName: string;
    verificationStatus: string;
    trustScore: number;
    lastVerifiedAt: string;
  };
  stats: {
    walletBalance: number;
    verificationsCount: number;
    totalP2PVolume: number;
  };
  wallet: {
    accountNumber: string;
    bankCode: string;
    status: string;
  };
  recentSessions: {
    _id: string;
    sessionCode: string;
    otherParty?: string;
    purpose?: string;
    amount: number;
    status: string;
    createdAt: string;
  }[];
  recentVerifications: {
    _id: string;
    trustScore: number;
    verdict: string;
    createdAt: string;
  }[];
}

export interface AuditLog {
  _id: string;
  action: string;
  actorId: string;
  actorType: string;
  targetId?: string;
  targetType?: string;
  metadata: any;
  createdAt: string;
}
