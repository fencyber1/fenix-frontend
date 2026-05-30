import { z } from 'zod';

/** Password policy mirrors the Fenix backend exactly. */
export const passwordSchema = z
  .string()
  .min(10, 'Password must be at least 10 characters')
  .max(128, 'Password is too long')
  .regex(/[a-z]/, 'Must contain a lowercase letter')
  .regex(/[A-Z]/, 'Must contain an uppercase letter')
  .regex(/[0-9]/, 'Must contain a digit')
  .regex(/[^A-Za-z0-9]/, 'Must contain a symbol');

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
});

export const resetSchema = z
  .object({
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: 'Passwords do not match', path: ['confirm'] });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirm: z.string(),
  })
  .refine((v) => v.newPassword === v.confirm, { message: 'Passwords do not match', path: ['confirm'] });

export type LoginValues = z.infer<typeof loginSchema>;
export type ForgotValues = z.infer<typeof forgotSchema>;
export type ResetValues = z.infer<typeof resetSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
