import { z } from "zod";

// Registration with email and password
export const UserRegistrationSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  fullName: z.string().optional(),
});
export type UserEmailRegistrationDto = z.infer<typeof UserRegistrationSchema>;

// Login with email and password
export const UserLoginEmailSchema = z.object({
  email: z.email(),
  password: z.string(),
});
export type UserLoginEmailDto = z.infer<typeof UserLoginEmailSchema>;

// Update user profile
export const UpdateUserProfileSchema = z
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
export type UpdateUserProfileDto = z.infer<typeof UpdateUserProfileSchema>;

// Verify email address
export const VerifyEmailSchema = z.object({
  token: z.string(),
});
export type VerifyUserEmailDto = z.infer<typeof VerifyEmailSchema>;

// Google OAuth authentication
export const UserGoogleAuthSchema = z.object({
  idToken: z.string(),
});
export type UserGoogleAuthDto = z.infer<typeof UserGoogleAuthSchema>;

// Refresh token
export const UserRefreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});
export type UserRefreshTokenDto = z.infer<typeof UserRefreshTokenSchema>;
