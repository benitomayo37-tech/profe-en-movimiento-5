export type AccessPlan = "free" | "pro";
export type AppRole = "teacher" | "admin";

export interface AuthAccess {
  configured: boolean;
  authenticated: boolean;
  userId: string | null;
  email: string | null;
  fullName: string | null;
  plan: AccessPlan;
  role: AppRole;
  hasProAccess: boolean;
}

export interface AuthActionState {
  status: "idle" | "error" | "success";
  message: string;
  fieldErrors?: Partial<Record<"fullName" | "email" | "password" | "confirmPassword", string>>;
}

export const initialAuthActionState: AuthActionState = {
  status: "idle",
  message: "",
};
