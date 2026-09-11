export type CourseShift =
  | "Matutina"
  | "Vespertina"
  | "Nocturna"
  | "Otra";

export type StudentStatus =
  | "active"
  | "inactive"
  | "withdrawn";

export interface PhysicalEducationCourse {
  id: string;
  teacherId: string;
  name: string;
  educationLevel: string;
  grade: string;
  parallel: string;
  schoolYear: string;
  shift: string | null;
  active: boolean;
  studentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PhysicalEducationStudent {
  id: string;
  teacherId: string;
  courseId: string;
  firstNames: string;
  lastNames: string;
  studentCode: string | null;
  listNumber: number | null;
  status: StudentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseInput {
  name: string;
  educationLevel: string;
  grade: string;
  parallel: string;
  schoolYear: string;
  shift: string | null;
}

export interface UpdateCourseInput extends CreateCourseInput {
  id: string;
  active: boolean;
}

export interface CreateStudentInput {
  courseId: string;
  firstNames: string;
  lastNames: string;
  studentCode: string | null;
  listNumber: number | null;
}

export interface UpdateStudentInput extends CreateStudentInput {
  id: string;
  status: StudentStatus;
}

export interface StudentCsvRow {
  rowNumber: number;
  firstNames: string;
  lastNames: string;
  studentCode: string | null;
  listNumber: number | null;
}

export interface StudentCsvRowError {
  rowNumber: number;
  message: string;
}

export interface StudentImportResult {
  imported: number;
  rejected: number;
  errors: StudentCsvRowError[];
}

export interface NotebookActionResult<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
  fieldErrors?: Record<string, string>;
}
export type AttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "excused";

export interface AttendanceRecord {
  id: string;
  teacherId: string;
  attendanceSessionId: string;
  courseId: string;
  studentId: string;
  status: AttendanceStatus;
  observation: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceSession {
  id: string;
  teacherId: string;
  courseId: string;
  attendanceDate: string;
  classNote: string | null;
  records: AttendanceRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceEntryInput {
  studentId: string;
  status: AttendanceStatus;
  observation: string | null;
}

export interface SaveAttendanceInput {
  courseId: string;
  attendanceDate: string;
  classNote: string | null;
  entries: AttendanceEntryInput[];
}

export interface AttendanceTotals {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
}

export interface AttendanceDaySummary
  extends AttendanceTotals {
  sessionId: string;
  attendanceDate: string;
  classNote: string | null;
}
