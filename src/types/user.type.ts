export enum UserType {
  STUDENT = "STUDENT",
  RECRUITER = "RECRUITER",
  COMPANY_ADMIN = "COMPANY_ADMIN",
  COLLEGE_ADMIN = "COLLEGE_ADMIN",
  TPO = "TPO",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export enum AuthProvider {
  PASSWORD = "PASSWORD",
  GOOGLE = "GOOGLE",
  GITHUB = "GITHUB",
  MICROSOFT = "MICROSOFT",
  SSO = "SSO",
}

export interface User {
  id: string;

  // Core Identity
  fullName: string;
  email: string;
  phone?: string | null;
  resumeUrl?: string | null;

  // Social Links
  linkedInUrl?: string | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  twitterUrl?: string | null;

  // Authentication
  passwordHash?: string | null;
  authProvider: AuthProvider;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLoginAt?: Date | null;

  // Role & Type
  userType: UserType;

  // Optional structured profile
  profile?: any | null;

  // Status & Lifecycle
  isActive: boolean;
  onboardingStep: number;

  // App Settings / Flags
  languagePreference?: string | null;
  notificationPrefs?: any | null;
  featureFlags?: any | null;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
