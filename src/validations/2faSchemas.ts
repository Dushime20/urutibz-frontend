import { z } from 'zod';

export const twoFactorSetupSchema = z.object({
  code: z
    .string()
    .min(6, 'Code must be exactly 6 digits')
    .max(6, 'Code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Code must contain only digits'),
});

export const twoFactorVerificationSchema = z.object({
  code: z
    .string()
    .min(6, 'Code must be exactly 6 digits')
    .max(6, 'Code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Code must contain only digits'),
});

export const twoFactorBackupSchema = z.object({
  backupCode: z
    .string()
    .min(8, 'Backup code must be exactly 7 characters')
    .max(8, 'Backup code must be exactly 7 characters')
    .regex(/^[A-Z0-9]{8}$/, 'Backup code must be 7 uppercase letters/numbers'),
});

export const twoFactorDisableSchema = z.object({
  code: z
    .string()
    .min(6, 'Code must be exactly 6 digits')
    .max(6, 'Code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Code must contain only digits'),
});

export type TwoFactorSetupFormData = z.infer<typeof twoFactorSetupSchema>;
export type TwoFactorVerificationFormData = z.infer<typeof twoFactorVerificationSchema>;
export type TwoFactorBackupFormData = z.infer<typeof twoFactorBackupSchema>;
export type TwoFactorDisableFormData = z.infer<typeof twoFactorDisableSchema>;
