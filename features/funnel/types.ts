export interface LeadCaptureState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"fullName" | "email" | "profileType" | "consent", string>>;
}

export const initialLeadCaptureState: LeadCaptureState = { status: "idle" };
