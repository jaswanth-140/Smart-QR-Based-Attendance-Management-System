export type BackendRole = "STUDENT" | "TEACHER" | "ADMIN";
export type BackendAttendanceStatus = "PRESENT" | "ABSENT" | "EXCUSED" | "LATE" | "REVIEW";

export interface BackendUser {
  id: number;
  name: string;
  email: string;
  role: BackendRole;
  studentId?: string | null;
  department?: string | null;
  twoFactorEnabled?: boolean;
}

export interface BackendJwtResponse {
  token: string;
  id: number;
  name: string;
  email: string;
  role: BackendRole;
  studentId?: string | null;
  department?: string | null;
}

export interface BackendDevice {
  id: number;
  hardwareIdentifier: string;
  deviceName: string;
  registeredAt: string;
  lastActiveAt?: string;
  current: boolean;
}

export interface BackendCourse {
  id: number;
  code: string;
  name: string;
  schedule?: string | null;
  teacher: {
    id: number;
    name: string;
  };
}

export interface BackendSession {
  id: number;
  course: BackendCourse;
  startTime: string;
  endTime?: string | null;
  latitude: number;
  longitude: number;
  active: boolean;
}

export interface BackendSessionQrCode {
  sessionId: number;
  qrToken: string;
  expiresAt: string;
  refreshIntervalSeconds: number;
}

export interface BackendAttendanceRecord {
  id: number;
  session: BackendSession;
  student: {
    id: number;
    name: string;
    studentId?: string | null;
  };
  device?: BackendDevice | null;
  timestamp: string;
  status: BackendAttendanceStatus;
  confidenceScore?: number | null;
  distanceMeters?: number | null;
  overrideReason?: string | null;
}
