import { api } from './client';
import type { ApiPaginated, ApiSuccess } from '@/types/api';
import type {
  AttendanceRecord,
  AttendanceReport,
  AuditLog,
  AuthUser,
  DashboardData,
  FeeInvoice,
  FeeStructure,
  FeeSummary,
  Grade,
  NotificationItem,
  NotificationPreference,
  Payment,
  PresignResult,
  ReportCard,
  Tenant,
  SchoolClass,
  TenantDocument,
  Staff,
  Student,
  Subject,
} from '@/types/models';

async function unwrap<T>(p: Promise<{ data: ApiSuccess<T> }>): Promise<T> {
  return (await p).data.data;
}
async function unwrapPaged<T>(
  p: Promise<{ data: ApiPaginated<T> }>,
): Promise<ApiPaginated<T>> {
  return (await p).data;
}

// ---------------- Auth ----------------
export const authApi = {
  login: (email: string, password: string) =>
    unwrap<{ accessToken: string; user: AuthUser }>(
      api.post('/auth/login', { email, password }),
    ),
  logout: () => api.post('/auth/logout', {}),
  me: () => unwrap<AuthUser>(api.get('/auth/me')),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token: string) => api.post('/auth/verify-email', { token }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
};

// ---------------- Students ----------------
export interface StudentListParams {
  page?: number;
  limit?: number;
  search?: string;
  classId?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
export const studentsApi = {
  list: (params: StudentListParams) => unwrapPaged<Student>(api.get('/students', { params })),
  get: (id: string) => unwrap<Student>(api.get(`/students/${id}`)),
  create: (body: Record<string, unknown>) => unwrap<Student>(api.post('/students', body)),
  update: (id: string, body: Record<string, unknown>) =>
    unwrap<Student>(api.put(`/students/${id}`, body)),
  remove: (id: string) => api.delete(`/students/${id}`),
  import: (csv: string, classId?: string, academicYear?: string) =>
    unwrap<{ created: number; skipped: number; errors: { row: number; message: string }[] }>(
      api.post('/students/import', { csv, classId, academicYear }),
    ),
};

// ---------------- Classes ----------------
export const classesApi = {
  list: (params: { page?: number; limit?: number; search?: string; academicYear?: string }) =>
    unwrapPaged<SchoolClass>(api.get('/classes', { params })),
  get: (id: string) => unwrap<SchoolClass>(api.get(`/classes/${id}`)),
  roster: (id: string) => unwrap<Student[]>(api.get(`/classes/${id}/roster`)),
  create: (body: Record<string, unknown>) => unwrap<SchoolClass>(api.post('/classes', body)),
  update: (id: string, body: Record<string, unknown>) =>
    unwrap<SchoolClass>(api.put(`/classes/${id}`, body)),
  remove: (id: string) => api.delete(`/classes/${id}`),
  enroll: (id: string, studentId: string, academicYear?: string) =>
    api.post(`/classes/${id}/enroll`, { studentId, academicYear }),
};

// ---------------- Subjects ----------------
export const subjectsApi = {
  list: (params: { classId?: string; teacherId?: string }) =>
    unwrap<Subject[]>(api.get('/subjects', { params })),
  create: (body: Record<string, unknown>) => unwrap<Subject>(api.post('/subjects', body)),
  update: (id: string, body: Record<string, unknown>) =>
    unwrap<Subject>(api.put(`/subjects/${id}`, body)),
  remove: (id: string) => api.delete(`/subjects/${id}`),
};

// ---------------- Attendance ----------------
export const attendanceApi = {
  bulkMark: (body: {
    classId: string;
    date: string;
    records: { studentId: string; status: string; note?: string }[];
  }) => unwrap<{ upserted: number; alertsQueued: number }>(api.post('/attendance', body)),
  list: (params: { studentId?: string; classId?: string; from?: string; to?: string; page?: number; limit?: number }) =>
    unwrapPaged<AttendanceRecord>(api.get('/attendance', { params })),
  correct: (id: string, body: { status: string; note?: string }) =>
    unwrap<AttendanceRecord>(api.put(`/attendance/${id}`, body)),
  report: (classId: string, month: string) =>
    unwrap<AttendanceReport>(api.get('/attendance/report', { params: { classId, month } })),
};

// ---------------- Grades ----------------
export const gradesApi = {
  upsert: (body: Record<string, unknown>) => unwrap<Grade>(api.post('/grades', body)),
  update: (id: string, body: Record<string, unknown>) => unwrap<Grade>(api.put(`/grades/${id}`, body)),
  list: (params: { studentId?: string; subjectId?: string; term?: string }) =>
    unwrapPaged<Grade>(api.get('/grades', { params })),
  reportCard: (studentId: string, term: string) =>
    unwrap<ReportCard>(api.get('/grades/report-card', { params: { studentId, term } })),
};

// ---------------- Fees ----------------
export const feesApi = {
  listStructures: () => unwrap<FeeStructure[]>(api.get('/fees/structures')),
  createStructure: (body: Record<string, unknown>) =>
    unwrap<FeeStructure>(api.post('/fees/structures', body)),
  listInvoices: (params: { studentId?: string; status?: string; from?: string; to?: string; page?: number; limit?: number }) =>
    unwrapPaged<FeeInvoice>(api.get('/fees/invoices', { params })),
  getInvoice: (id: string) => unwrap<FeeInvoice>(api.get(`/fees/invoices/${id}`)),
  createInvoice: (body: Record<string, unknown>) =>
    unwrap<FeeInvoice>(api.post('/fees/invoices', body)),
  waiveInvoice: (id: string, reason: string) =>
    unwrap<FeeInvoice>(api.post(`/fees/invoices/${id}/waive`, { reason })),
  recordPayment: (body: Record<string, unknown>) =>
    unwrap<{ payment: Payment; invoice: FeeInvoice }>(api.post('/fees/payments', body)),
  summary: (params: { classId?: string; academicYear?: string }) =>
    unwrap<FeeSummary>(api.get('/fees/summary', { params })),
};

// ---------------- Staff & Users ----------------
export const staffApi = {
  list: (params: { page?: number; limit?: number; search?: string; department?: string }) =>
    unwrapPaged<Staff>(api.get('/staff', { params })),
  get: (id: string) => unwrap<Staff>(api.get(`/staff/${id}`)),
  create: (body: Record<string, unknown>) =>
    unwrap<{ id: string; userId: string; email: string }>(api.post('/staff', body)),
  update: (id: string, body: Record<string, unknown>) => unwrap<Staff>(api.put(`/staff/${id}`, body)),
  remove: (id: string) => api.delete(`/staff/${id}`),
};
export const usersApi = {
  invite: (body: Record<string, unknown>) =>
    unwrap<{ userId: string; email: string }>(api.post('/users/invite', body)),
};

// ---------------- Notifications ----------------
export const notificationsApi = {
  list: (params: { isRead?: boolean; page?: number; limit?: number }) =>
    unwrapPaged<NotificationItem>(api.get('/notifications', { params })),
  markRead: (id: string) => unwrap<NotificationItem>(api.patch(`/notifications/${id}/read`)),
  markAllRead: () => unwrap<{ updated: number }>(api.patch('/notifications/read-all')),
};

// ---------------- Tenant / Settings ----------------
export const tenantApi = {
  get: () => unwrap<Tenant>(api.get('/tenants/me')),
  update: (body: Record<string, unknown>) => unwrap<Tenant>(api.put('/tenants/me', body)),
  getPreferences: () => unwrap<NotificationPreference[]>(api.get('/tenants/me/notification-preferences')),
  setPreferences: (
    preferences: { type: string; channel: string; enabled: boolean }[],
  ) => unwrap<NotificationPreference[]>(api.put('/tenants/me/notification-preferences', { preferences })),
};

// ---------------- Audit ----------------
export const auditApi = {
  list: (params: { actor?: string; table?: string; from?: string; to?: string; page?: number; limit?: number }) =>
    unwrapPaged<AuditLog>(api.get('/audit-logs', { params })),
};

// ---------------- Documents ----------------
export const documentsApi = {
  list: (studentId: string) => unwrap<TenantDocument[]>(api.get('/documents', { params: { studentId } })),
  presign: (body: { studentId: string; fileName: string; mimeType: string; sizeBytes: number; type: string }) =>
    unwrap<PresignResult>(api.post('/documents/presign', body)),
  confirm: (body: Record<string, unknown>) => unwrap<TenantDocument>(api.post('/documents/confirm', body)),
  remove: (id: string) => api.delete(`/documents/${id}`),
};

// ---------------- Dashboard ----------------
export const dashboardApi = {
  get: () => unwrap<DashboardData>(api.get('/dashboard')),
};
