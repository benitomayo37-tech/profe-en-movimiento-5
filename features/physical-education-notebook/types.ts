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
