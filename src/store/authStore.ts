import { create } from "zustand";
import { api, ApiError } from "@/lib/api";
import { BackendDevice, BackendJwtResponse, BackendUser } from "@/lib/backend-types";

export type UserRole = "admin" | "teacher" | "student";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  studentId?: string;
  avatar?: string;
}

export interface Device {
  id: string;
  device_name: string;
  browser: string;
  os: string;
  last_active: string;
  device_fingerprint: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  devices: Device[];
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoadingDevices: boolean;
  authError: string | null;
  login: (identifier: string, password: string, role: UserRole) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole, studentId?: string, department?: string) => Promise<boolean>;
  initializeAuth: () => Promise<void>;
  logout: () => void;
  loadDevices: () => Promise<void>;
  addDevice: (device: Omit<Device, "id">) => Promise<void>;
  removeDevice: (id: string) => Promise<void>;
}

function mapRole(role: string): UserRole {
  const normalized = role.toUpperCase();
  if (normalized === "ADMIN") return "admin";
  if (normalized === "TEACHER") return "teacher";
  return "student";
}

function mapUser(user: BackendUser | BackendJwtResponse): User {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    role: mapRole(user.role),
    department: user.department ?? undefined,
    studentId: user.studentId ?? undefined,
  };
}

function parseDeviceFingerprint(hardwareId: string): { browser: string; os: string; fingerprint: string } {
  const parts = hardwareId.split("|");
  if (parts.length < 3) {
    return { browser: "Unknown", os: "Unknown", fingerprint: hardwareId };
  }

  return {
    browser: parts[0] || "Unknown",
    os: parts[1] || "Unknown",
    fingerprint: parts.slice(2).join("|") || hardwareId,
  };
}

function mapDevice(device: BackendDevice): Device {
  const parsed = parseDeviceFingerprint(device.hardwareIdentifier);
  return {
    id: String(device.id),
    device_name: device.deviceName,
    browser: parsed.browser,
    os: parsed.os,
    last_active: device.lastActiveAt ?? device.registeredAt,
    device_fingerprint: parsed.fingerprint,
  };
}

function buildHardwareIdentifier(device: Omit<Device, "id">): string {
  return `${device.browser}|${device.os}|${device.device_fingerprint}`;
}

function getStoredToken(): string | null {
  return localStorage.getItem("auth_token");
}

function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem("auth_token", token);
  } else {
    localStorage.removeItem("auth_token");
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: getStoredToken(),
  devices: [],
  isAuthenticated: !!getStoredToken(),
  isInitializing: true,
  isLoadingDevices: false,
  authError: null,

  login: async (identifier: string, password: string, role: UserRole) => {
    set({ authError: null });
    try {
      const response = await api.post<BackendJwtResponse>("/auth/login", {
        identifier: identifier.trim(),
        password,
      });

      const mappedUser = mapUser(response);
      if (mappedUser.role !== role) {
        throw new ApiError(403, `This account is not authorized for ${role} login.`);
      }

      setStoredToken(response.token);
      set({
        token: response.token,
        user: mappedUser,
        isAuthenticated: true,
      });

      await get().loadDevices();
      return true;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Unable to sign in.";
      set({ authError: message, isAuthenticated: false, user: null, token: null });
      setStoredToken(null);
      return false;
    }
  },

  register: async (name: string, email: string, password: string, role: UserRole, studentId?: string, department?: string) => {
    set({ authError: null });
    try {
      const response = await api.post<BackendJwtResponse>("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
        role: role.toUpperCase(),
        studentId: studentId?.trim(),
        department: department?.trim(),
      });

      const mappedUser = mapUser(response);
      setStoredToken(response.token);
      set({
        token: response.token,
        user: mappedUser,
        isAuthenticated: true,
      });

      await get().loadDevices();
      return true;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Unable to register.";
      set({ authError: message, isAuthenticated: false, user: null, token: null });
      setStoredToken(null);
      return false;
    }
  },

  initializeAuth: async () => {
    const token = getStoredToken();
    if (!token) {
      set({ isInitializing: false, isAuthenticated: false, user: null, token: null, devices: [] });
      return;
    }

    set({ isInitializing: true, token, isAuthenticated: true });
    try {
      const me = await api.get<BackendUser>("/users/me");
      set({ user: mapUser(me), isAuthenticated: true });
      await get().loadDevices();
    } catch {
      setStoredToken(null);
      set({ user: null, token: null, isAuthenticated: false, devices: [] });
    } finally {
      set({ isInitializing: false });
    }
  },

  logout: () => {
    setStoredToken(null);
    set({
      user: null,
      token: null,
      devices: [],
      isAuthenticated: false,
      authError: null,
      isInitializing: false,
    });
  },

  loadDevices: async () => {
    set({ isLoadingDevices: true });
    try {
      const devices = await api.get<BackendDevice[]>("/devices");
      set({ devices: devices.map(mapDevice) });
    } finally {
      set({ isLoadingDevices: false });
    }
  },

  addDevice: async (device) => {
    const payload = {
      hardwareIdentifier: buildHardwareIdentifier(device),
      deviceName: device.device_name,
    };

    await api.post<BackendDevice>("/devices", payload);
    await get().loadDevices();
  },

  removeDevice: async (id) => {
    await api.del<string>(`/devices/${id}`);
    set((state) => ({
      devices: state.devices.filter((d) => d.id !== id),
    }));
  },
}));
