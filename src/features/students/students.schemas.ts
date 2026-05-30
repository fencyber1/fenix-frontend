import { z } from 'zod';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

export const studentFormSchema = z.object({
  studentNumber: z.string().trim().min(1, 'Required').max(40),
  firstName: z.string().trim().min(1, 'Required').max(80),
  lastName: z.string().trim().min(1, 'Required').max(80),
  dob: dateString,
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  admissionDate: dateString,
  status: z.enum(['ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED', 'WITHDRAWN']),
  bloodGroup: z.string().trim().max(5).optional().or(z.literal('')),
  address: z.string().trim().max(300).optional().or(z.literal('')),
  medicalNotes: z.string().trim().max(2000).optional().or(z.literal('')),
  classId: z.string().uuid().optional().or(z.literal('')),
});

export type StudentFormValues = z.infer<typeof studentFormSchema>;
