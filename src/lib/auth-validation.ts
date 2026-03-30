import { UserRole } from "@/store/authStore";

export interface AuthFormValues {
  isLogin: boolean;
  role: UserRole;
  name: string;
  email: string;
  password: string;
  studentId: string;
  department: string;
}

export type AuthFormErrors = Partial<Record<keyof Omit<AuthFormValues, "isLogin" | "role">, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateAuthForm(values: AuthFormValues): AuthFormErrors {
  const errors: AuthFormErrors = {};

  if (!values.isLogin && values.name.trim().length < 2) {
    errors.name = "Use your full name.";
  }

  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Enter a valid university email address.";
  }

  if (values.password.trim().length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (!values.isLogin && values.role === "student" && values.studentId.trim().length < 4) {
    errors.studentId = "User ID is required for student accounts.";
  }

  if (!values.isLogin && values.role !== "admin" && values.department.trim().length < 2) {
    errors.department = "Department is required for student and teacher accounts.";
  }

  return errors;
}
