import type {
  AttendanceStatus,
  DocumentType,
  FeeFrequency,
  Gender,
  InvoiceStatus,
  NotificationChannel,
  NotificationType,
  PaymentMethod,
  Role,
  StudentStatus,
} from './api';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  tenantId: string;
  isVerified: boolean;
}

export interface Student {
  id: string;
  tenantId: string;
  userId: string | null;
  displayId: string | null;
  studentNumber: string;
  firstName: string;
  lastName: string;
  dob: string | null;
  gender: Gender;
  photoUrl: string | null;
  admissionDate: string | null;
  status: StudentStatus;
  bloodGroup: string | null;
  medicalNotes: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClassTeacherRef {
  id: string;
  firstName: string;
  lastName: string;
}

export interface SchoolClass {
  id: string;
  tenantId: string;
  name: string;
  section: string;
  academicYear: string;
  classTeacherId: string | null;
  capacity: number;
  classTeacher?: ClassTeacherRef | null;
  _count?: { enrollments: number; subjects: number };
}

export interface Subject {
  id: string;
  classId: string;
  name: string;
  code: string;
  teacherId: string | null;
  teacher?: ClassTeacherRef | null;
  class?: { id: string; name: string; section: string };
}

export interface Staff {
  id: string;
  userId: string;
  tenantId: string;
  displayId: string | null;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string | null;
  phone: string | null;
  photoUrl: string | null;
  joinDate: string;
  user?: { email: string; role: Role; isVerified: boolean; lastLoginAt?: string | null };
  classesAsTeacher?: { id: string; name: string; section: string }[];
  subjectsTaught?: { id: string; name: string; code: string }[];
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: AttendanceStatus;
  recordedBy: string;
  note: string | null;
  student?: { firstName: string; lastName: string; studentNumber: string };
}

export interface AttendanceReport {
  classId: string;
  month: string;
  totals: Record<AttendanceStatus, number>;
  perStudent: {
    studentId: string;
    name: string;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendanceRate: number;
  }[];
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  term: string;
  score: string;
  maxScore: string;
  gradeLetter: string;
  remark: string | null;
  recordedAt: string;
  subject?: { name: string; code: string };
  student?: { firstName: string; lastName: string; studentNumber: string };
}

export interface ReportCard {
  student: { id: string; name: string; studentNumber: string };
  term: string;
  tenant: { name: string; logoUrl: string | null };
  subjects: {
    subject: string;
    code: string;
    score: number;
    maxScore: number;
    percentage: number;
    letter: string;
    remark: string | null;
  }[];
  summary: { average: number; gpa: number; totalSubjects: number };
}

export interface FeeStructure {
  id: string;
  tenantId: string;
  name: string;
  amount: string;
  frequency: FeeFrequency;
  academicYear: string;
}

export interface FeeInvoice {
  id: string;
  studentId: string;
  feeStructureId: string;
  dueDate: string;
  amount: string;
  amountPaid: string;
  status: InvoiceStatus;
  invoiceNumber: string;
  notes: string | null;
  balance?: number;
  feeStructure?: { name: string; frequency: FeeFrequency };
  student?: { firstName: string; lastName: string; studentNumber: string };
  payments?: Payment[];
}

export interface Payment {
  id: string;
  invoiceId: string;
  amountPaid: string;
  paymentDate: string;
  method: PaymentMethod;
  reference: string | null;
  recordedBy: string;
}

export interface FeeSummary {
  totalBilled: number;
  totalCollected: number;
  totalOutstanding: number;
  totalWaived: number;
  invoiceCount: number;
  byStatus: Record<InvoiceStatus, number>;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  body: string;
  isRead: boolean;
  sentAt: string;
  readAt: string | null;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  enabled: boolean;
}

export interface AuditLog {
  id: string;
  actorId: string | null;
  action: string;
  tableName: string;
  recordId: string;
  beforeJson: unknown;
  afterJson: unknown;
  ipAddress: string | null;
  createdAt: string;
  actor?: { email: string; role: Role } | null;
}

export interface TenantDocument {
  id: string;
  studentId: string;
  name: string;
  type: DocumentType;
  fileUrl: string;
  fileKey: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  logoUrl: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  academicYearStart: string;
  timezone: string;
}

export interface DashboardData {
  kpis: {
    totalStudents: number;
    activeStudents: number;
    totalStaff: number;
    totalClasses: number;
    attendanceRateToday: number;
    outstandingFees: number;
    collectedThisMonth: number;
  };
  charts: {
    attendanceTrend: {
      date: string;
      present: number;
      absent: number;
      late: number;
      excused: number;
    }[];
    feeStatusBreakdown: { status: InvoiceStatus; count: number }[];
    enrollmentByClass: { className: string; count: number }[];
  };
  alerts: { id: string; type: string; message: string; severity: 'info' | 'warning' | 'danger' }[];
}

export interface PresignResult {
  uploadUrl: string;
  method: 'PUT' | 'POST';
  headers: Record<string, string>;
  key: string;
  publicUrl: string;
  expiresIn: number;
}

export interface StudentDashboardData {
  kpis: {
    firstName: string;
    attendanceToday: string;
    averageGrade: number;
    pendingFees: number;
    myClass: string;
    totalTasks: number;
  };
  subjectPerformance: {
    subject: string;
    code: string;
    score: number;
    teacherName: string;
  }[];
  subjectAttendance: {
    subject: string;
    code: string;
    percentage: number;
  }[];
  teachers: {
    firstName: string;
    lastName: string;
    role: string;
    subject: string;
  }[];
  recentGrades: {
    subject: string;
    score: string;
    maxScore: string;
    gradeLetter: string;
    term: string;
    recordedAt: string;
  }[];
  upcomingFees: {
    id: string;
    invoiceNumber: string;
    feeName: string;
    amount: number;
    amountPaid: number;
    dueDate: string;
    status: InvoiceStatus;
  }[];
}

export interface ParentDashboardData {
  children: {
    id: string;
    name: string;
    studentNumber: string;
    className: string;
    attendanceToday: string;
    averageGrade: number;
    pendingFees: number;
  }[];
  overallPendingFees: number;
}
