import { describe, expect, it } from "vitest";

import { validateAuthForm } from "@/lib/auth-validation";

describe("validateAuthForm", () => {
  it("accepts a valid login payload", () => {
    expect(
      validateAuthForm({
        isLogin: true,
        role: "student",
        name: "",
        email: "student@university.edu",
        password: "password123",
        studentId: "",
        department: "",
      }),
    ).toEqual({});
  });

  it("requires signup-only student fields", () => {
    expect(
      validateAuthForm({
        isLogin: false,
        role: "student",
        name: "A",
        email: "invalid-email",
        password: "123",
        studentId: "",
        department: "",
      }),
    ).toEqual({
      name: "Use your full name.",
      email: "Enter a valid university email address.",
      password: "Password must be at least 8 characters.",
      studentId: "User ID is required for student accounts.",
      department: "Department is required for student and teacher accounts.",
    });
  });
});
