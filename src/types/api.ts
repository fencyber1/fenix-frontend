/** Shared API response envelope types (mirrors the Fenix backend). */

export interface FieldError {
  field: string;
  message: string;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiPaginated<T> {
  success: true;
  message: string;
  data: T[];
  meta: PaginationMeta;
}

export interface ApiError {
  success: false;
  message: string;
  errors: FieldError[];
  code: string;
  requestId?: string;
}

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'PARENT' | 'STUDENT';

export type StudentStatus = 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'SUSPENDED' | 'WITHDRAWN';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
export type InvoiceStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'WAIVED';
export type PaymentMethod = 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'CHEQUE';
export type FeeFrequency = 'ONE_TIME' | 'MONTHLY' | 'TERMLY' | 'ANNUAL';
export type NotificationType =
  | 'ATTENDANCE_ALERT'
  | 'FEE_REMINDER'
  | 'REPORT_CARD'
  | 'GENERAL'
  | 'ACCOUNT';
export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS';
export type DocumentType =
  | 'PHOTO'
  | 'BIRTH_CERTIFICATE'
  | 'REPORT_CARD'
  | 'MEDICAL'
  | 'ID_CARD'
  | 'OTHER';
