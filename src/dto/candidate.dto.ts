import { z } from "zod";

// Registration with email and password
export const CandidateRegistrationSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  fullName: z.string().optional(),
});
export type CandidateEmailRegistrationDto = z.infer<
  typeof CandidateRegistrationSchema
>;

// Login with email and password
export const CandidateLoginEmailSchema = z.object({
  email: z.email(),
  password: z.string(),
});
export type CandidateLoginEmailDto = z.infer<typeof CandidateLoginEmailSchema>;

// Update user profile
export const UpdateCandidateProfileSchema = z
  .object({
    fullName: z.string().min(1).optional(),
    phone: z
      .string()
      .regex(/^(\+91)?[6-9]\d{9}$/, { message: "Invalid Indian phone number" })
      .optional(),
    resumeUrl: z.url().optional(),
    linkedInUrl: z.url().optional(),
    githubUrl: z.url().optional(),
    portfolioUrl: z.url().optional(),
    twitterUrl: z.url().optional(),
    profile: z.any().optional(),
    languagePreference: z.string().min(2).max(5).optional(),
    notificationPrefs: z.record(z.string(), z.boolean()).optional(),
    featureFlags: z.record(z.string(), z.any()).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update.",
  });
export type UpdateCandidateProfileDto = z.infer<
  typeof UpdateCandidateProfileSchema
>;

// Verify email address
export const VerifyEmailSchema = z.object({
  token: z.string(),
});
export type VerifyCandidateEmailDto = z.infer<typeof VerifyEmailSchema>;

// Google OAuth authentication
export const CandidateGoogleAuthSchema = z.object({
  idToken: z.string(),
});
export type CandidateGoogleAuthDto = z.infer<typeof CandidateGoogleAuthSchema>;

// Refresh token
export const CandidateRefreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});
export type CandidateRefreshTokenDto = z.infer<
  typeof CandidateRefreshTokenSchema
>;

