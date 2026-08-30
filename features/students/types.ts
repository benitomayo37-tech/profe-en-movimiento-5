export interface StudentSession {
  studentId: string;
  fullName: string;
  institution: string;
  educationLevel: string;
  gradeCourse: string;
  expiresAt: number;
}

export interface StudentActionState {
  status: "idle" | "error" | "success";
  message: string;
  fieldErrors?: Partial<Record<
    "fullName" | "displayName" | "institution" | "educationLevel" | "gradeCourse" | "pin" | "confirmPin",
    string
  >>;
}

export const initialStudentActionState: StudentActionState = {
  status: "idle",
  message: "",
};
