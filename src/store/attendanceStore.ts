import { create } from "zustand";
import { api } from "@/lib/api";
import {
  BackendAttendanceRecord,
  BackendAttendanceStatus,
  BackendCourse,
  BackendSession,
  BackendSessionQrCode,
} from "@/lib/backend-types";

export interface Course {
  id: string;
  course_code: string;
  course_name: string;
  section: string;
  teacher_id: string;
  teacher_name: string;
  schedule: string;
  room: string;
}

export interface Session {
  id: string;
  course_id: string;
  course_code: string;
  course_name: string;
  section: string;
  date: string;
  start_time: string;
  end_time: string;
  room: string;
  qr_active: boolean;
  latitude?: number;
  longitude?: number;
}

export type AttendanceStatus = "present" | "absent" | "late" | "review" | "excused";
export type ConfidenceLevel = "high" | "review" | "rejected";

export interface AttendanceRecord {
  id: string;
  session_id: string;
  student_id: string;
  student_name: string;
  status: AttendanceStatus;
  distance: number;
  confidence: ConfidenceLevel;
  timestamp: string;
  override_reason?: string;
}

export interface StudentAttendanceSummary {
  course_code: string;
  course_name: string;
  total_sessions: number;
  attended: number;
  percentage: number;
}

interface AttendanceState {
  courses: Course[];
  sessions: Session[];
  records: AttendanceRecord[];
  studentSummaries: StudentAttendanceSummary[];
  activeQrSession: string | null;
  isLoading: boolean;
  error: string | null;
  loadCourses: () => Promise<void>;
  loadActiveSessions: () => Promise<void>;
  loadStudentAttendance: () => Promise<void>;
  loadSessionAttendance: (sessionId: string) => Promise<void>;
  loadCourseAttendance: (courseId: string) => Promise<void>;
  createSession: (courseId: string, latitude: number, longitude: number) => Promise<Session>;
  rotateSessionQr: (sessionId: string) => Promise<BackendSessionQrCode>;
  endSession: (sessionId: string) => Promise<void>;
  markAttendanceByScan: (payload: {
    sessionId: string;
    qrToken: string;
    latitude: number;
    longitude: number;
    deviceHardwareId: string;
  }) => Promise<BackendAttendanceRecord>;
  setActiveQrSession: (sessionId: string | null) => void;
  overrideStatus: (recordId: string, status: AttendanceStatus, reason: string) => Promise<void>;
  clearError: () => void;
}

function backendStatusToUi(status: BackendAttendanceStatus): AttendanceStatus {
  switch (status) {
    case "PRESENT":
      return "present";
    case "ABSENT":
      return "absent";
    case "LATE":
      return "late";
    case "EXCUSED":
      return "excused";
    default:
      return "review";
  }
}

function confidenceToUi(status: AttendanceStatus, score?: number | null): ConfidenceLevel {
  if (status === "absent") return "rejected";
  if (status === "review") return "review";
  if ((score ?? 100) >= 80) return "high";
  return "review";
}

function mapCourse(course: BackendCourse): Course {
  const section = extractSectionFromCourseCode(course.code);
  return {
    id: String(course.id),
    course_code: course.code,
    course_name: course.name,
    section,
    teacher_id: String(course.teacher?.id ?? ""),
    teacher_name: course.teacher?.name ?? "Unassigned",
    schedule: course.schedule ?? "TBA",
    room: section ? `Section ${section}` : "Campus Classroom",
  };
}

function formatTime(dateIso: string): string {
  const date = new Date(dateIso);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function mapSession(session: BackendSession): Session {
  const section = extractSectionFromCourseCode(session.course.code);
  return {
    id: String(session.id),
    course_id: String(session.course.id),
    course_code: session.course.code,
    course_name: session.course.name,
    section,
    date: new Date(session.startTime).toISOString().slice(0, 10),
    start_time: formatTime(session.startTime),
    end_time: session.endTime ? formatTime(session.endTime) : "--:--",
    room: section ? `Section ${section}` : "Campus Classroom",
    qr_active: session.active,
    latitude: session.latitude,
    longitude: session.longitude,
  };
}

function mapRecord(record: BackendAttendanceRecord): AttendanceRecord {
  const status = backendStatusToUi(record.status);
  return {
    id: String(record.id),
    session_id: String(record.session.id),
    student_id: record.student.studentId ?? String(record.student.id),
    student_name: record.student.name,
    status,
    distance: Number(record.distanceMeters ?? 0),
    confidence: confidenceToUi(status, record.confidenceScore),
    timestamp: record.timestamp,
    override_reason: record.overrideReason ?? undefined,
  };
}

function buildSummaries(records: AttendanceRecord[], sessions: Session[]): StudentAttendanceSummary[] {
  const sessionById = new Map(sessions.map((session) => [session.id, session]));
  const grouped = new Map<string, StudentAttendanceSummary>();

  for (const record of records) {
    const session = sessionById.get(record.session_id);
    if (!session) continue;

    const key = session.course_code;
    const existing = grouped.get(key) ?? {
      course_code: session.course_code,
      course_name: session.course_name,
      total_sessions: 0,
      attended: 0,
      percentage: 0,
    };

    existing.total_sessions += 1;
    if (record.status === "present" || record.status === "late" || record.status === "excused") {
      existing.attended += 1;
    }
    grouped.set(key, existing);
  }

  return Array.from(grouped.values()).map((summary) => ({
    ...summary,
    percentage: summary.total_sessions ? Number(((summary.attended / summary.total_sessions) * 100).toFixed(1)) : 0,
  }));
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unexpected error occurred";
}

function extractSectionFromCourseCode(code: string): string {
  const parts = code.split("-");
  return parts.length >= 3 ? parts[1] : "";
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  courses: [],
  sessions: [],
  records: [],
  studentSummaries: [],
  activeQrSession: null,
  isLoading: false,
  error: null,

  loadCourses: async () => {
    set({ isLoading: true, error: null });
    try {
      const courses = await api.get<BackendCourse[]>("/courses/my-courses");
      set({ courses: courses.map(mapCourse) });
    } catch (error) {
      set({ error: extractErrorMessage(error) });
    } finally {
      set({ isLoading: false });
    }
  },

  loadActiveSessions: async () => {
    set({ isLoading: true, error: null });
    try {
      const sessions = await api.get<BackendSession[]>("/sessions/active");
      set({ sessions: sessions.map(mapSession) });
    } catch (error) {
      set({ error: extractErrorMessage(error) });
    } finally {
      set({ isLoading: false });
    }
  },

  loadStudentAttendance: async () => {
    set({ isLoading: true, error: null });
    try {
      const recordsRaw = await api.get<BackendAttendanceRecord[]>("/attendance/history");

      const records = recordsRaw.map(mapRecord);
      const sessionsFromRecords = recordsRaw.map((record) => mapSession(record.session));
      const sessions = sessionsFromRecords.filter(
        (session, index, array) => array.findIndex((x) => x.id === session.id) === index,
      );
      set({
        records,
        sessions,
        studentSummaries: buildSummaries(records, sessions),
      });
    } catch (error) {
      set({ error: extractErrorMessage(error) });
    } finally {
      set({ isLoading: false });
    }
  },

  loadSessionAttendance: async (sessionId: string) => {
    set({ isLoading: true, error: null });
    try {
      const recordsRaw = await api.get<BackendAttendanceRecord[]>(`/attendance/session/${sessionId}`);
      set({ records: recordsRaw.map(mapRecord) });
    } catch (error) {
      set({ error: extractErrorMessage(error) });
    } finally {
      set({ isLoading: false });
    }
  },

  loadCourseAttendance: async (courseId: string) => {
    set({ isLoading: true, error: null });
    try {
      const recordsRaw = await api.get<BackendAttendanceRecord[]>(`/attendance/course/${courseId}`);
      set({ records: recordsRaw.map(mapRecord) });
    } catch (error) {
      set({ error: extractErrorMessage(error) });
    } finally {
      set({ isLoading: false });
    }
  },

  createSession: async (courseId: string, latitude: number, longitude: number) => {
    const created = await api.post<BackendSession>("/sessions", {
      courseId: Number(courseId),
      latitude,
      longitude,
    });

    const mapped = mapSession(created);
    set((state) => ({
      sessions: [mapped, ...state.sessions],
      activeQrSession: mapped.id,
    }));

    return mapped;
  },

  endSession: async (sessionId: string) => {
    await api.put<BackendSession>(`/sessions/${sessionId}/end`);
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === sessionId ? { ...session, qr_active: false } : session,
      ),
    }));
  },

  rotateSessionQr: async (sessionId: string) => {
    return api.post<BackendSessionQrCode>(`/sessions/${sessionId}/qr-token`);
  },

  markAttendanceByScan: async (payload) => {
    const record = await api.post<BackendAttendanceRecord>("/attendance/scan", {
      sessionId: Number(payload.sessionId),
      qrToken: payload.qrToken,
      latitude: payload.latitude,
      longitude: payload.longitude,
      deviceHardwareId: payload.deviceHardwareId,
    });
    const mapped = mapRecord(record);
    set((state) => {
      const nextRecords = [mapped, ...state.records.filter((entry) => entry.id !== mapped.id)];
      return {
        records: nextRecords,
        studentSummaries: buildSummaries(nextRecords, state.sessions),
      };
    });
    return record;
  },

  setActiveQrSession: (sessionId) => set({ activeQrSession: sessionId }),

  overrideStatus: async (recordId, status, reason) => {
    const backendStatus = {
      present: "PRESENT",
      absent: "ABSENT",
      late: "LATE",
      review: "REVIEW",
      excused: "EXCUSED",
    }[status];

    const updated = await api.post<BackendAttendanceRecord>(`/attendance/${recordId}/override`, {
      status: backendStatus,
      reason,
    });

    const mapped = mapRecord(updated);
    set((state) => ({
      records: state.records.map((record) => (record.id === recordId ? mapped : record)),
    }));
  },

  clearError: () => set({ error: null }),
}));
