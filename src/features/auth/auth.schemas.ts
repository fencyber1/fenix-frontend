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
  role: z.enum(['TEACHER', 'STUDENT', 'PARENT']).optional(),
  schoolId: z.string().trim().min(1, 'School ID is required').max(50).optional(),
  classId: z.string().trim().min(1).max(50).optional(),
  studentId: z.string().trim().min(1).max(50).optional(),
}).superRefine((v, ctx) => {
  if (!v.role) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Select a role', path: ['role'] });
    return;
  }
  if (!v.schoolId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'School ID is required', path: ['schoolId'] });
  }
  if (v.role === 'STUDENT' && !v.classId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Class ID is required for students', path: ['classId'] });
  }
  if (v.role === 'PARENT' && !v.studentId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Student ID is required for parents', path: ['studentId'] });
  }
});

export const registerSchema = z
  .object({
    schoolName: z.string().trim().min(2, 'School name is required').max(160),
    firstName: z.string().trim().min(1, 'First name is required').max(100),
    lastName: z.string().trim().min(1, 'Last name is required').max(100),
    email: z.string().trim().toLowerCase().email('Enter a valid email'),
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: 'Passwords do not match', path: ['confirm'] });

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
export type RegisterValues = z.infer<typeof registerSchema>;
export type ForgotValues = z.infer<typeof forgotSchema>;
export type ResetValues = z.infer<typeof resetSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
