import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { useAttendanceStore } from "@/store/attendanceStore";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import { AppLoader } from "@/components/AppLoader";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const StudentDashboard = lazy(() => import("./pages/student/StudentDashboard"));
const MyAttendancePage = lazy(() => import("./pages/student/MyAttendancePage"));
const HelpPage = lazy(() => import("./pages/student/HelpPage"));
const ScanPage = lazy(() => import("./pages/student/ScanPage"));
const TeacherDashboard = lazy(() => import("./pages/teacher/TeacherDashboard"));
const ClassesPage = lazy(() => import("./pages/teacher/ClassesPage"));
const SessionPage = lazy(() => import("./pages/teacher/SessionPage"));
const AttendancePage = lazy(() => import("./pages/teacher/AttendancePage"));
const OverridePage = lazy(() => import("./pages/teacher/OverridePage"));
const ReportsPage = lazy(() => import("./pages/teacher/ReportsPage"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminStudentsPage = lazy(() => import("./pages/admin/AdminStudentsPage"));
const AdminTeachersPage = lazy(() => import("./pages/admin/AdminTeachersPage"));
const AdminCoursesPage = lazy(() => import("./pages/admin/AdminCoursesPage"));
const AdminClassroomsPage = lazy(() => import("./pages/admin/AdminClassroomsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Index = lazy(() => import("./pages/Index"));

const queryClient = new QueryClient();

function AppBootstrap() {
  const { isAuthenticated, isInitializing, user, initializeAuth } = useAuthStore();
  const { loadCourses, loadActiveSessions, loadStudentAttendance } = useAttendanceStore();

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    if (user.role === "student") {
      void Promise.all([loadCourses(), loadStudentAttendance()]);
      return;
    }

    void Promise.all([loadCourses(), loadActiveSessions()]);
  }, [isAuthenticated, user, loadCourses, loadStudentAttendance, loadActiveSessions]);

  if (isInitializing) {
    return <AppLoader message="Initializing workspace..." compact />;
  }

  return null;
}

function DashboardRouter() {
  const { user, isInitializing } = useAuthStore();
  if (isInitializing) return null;
  if (!user) return <Navigate to="/login" replace />;
  
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'teacher') return <TeacherDashboard />;
  return <StudentDashboard />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppErrorBoundary>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppBootstrap />
          <Suspense fallback={<AppLoader compact />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["student", "teacher", "admin"]}><DashboardRouter /></ProtectedRoute>} />
              <Route path="/my-attendance" element={<ProtectedRoute allowedRoles={["student"]}><MyAttendancePage /></ProtectedRoute>} />
              <Route path="/scan" element={<ProtectedRoute allowedRoles={["student"]}><ScanPage /></ProtectedRoute>} />
              <Route path="/help" element={<ProtectedRoute allowedRoles={["student"]}><HelpPage /></ProtectedRoute>} />

              <Route path="/classes" element={<ProtectedRoute allowedRoles={["teacher"]}><ClassesPage /></ProtectedRoute>} />
              <Route path="/session/:id" element={<ProtectedRoute allowedRoles={["teacher"]}><SessionPage /></ProtectedRoute>} />
              <Route path="/attendance" element={<ProtectedRoute allowedRoles={["teacher"]}><AttendancePage /></ProtectedRoute>} />
              <Route path="/override" element={<ProtectedRoute allowedRoles={["teacher"]}><OverridePage /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute allowedRoles={["teacher"]}><ReportsPage /></ProtectedRoute>} />

              <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/students" element={<ProtectedRoute allowedRoles={["admin"]}><AdminStudentsPage /></ProtectedRoute>} />
              <Route path="/admin/teachers" element={<ProtectedRoute allowedRoles={["admin"]}><AdminTeachersPage /></ProtectedRoute>} />
              <Route path="/admin/courses" element={<ProtectedRoute allowedRoles={["admin"]}><AdminCoursesPage /></ProtectedRoute>} />
              <Route path="/admin/classrooms" element={<ProtectedRoute allowedRoles={["admin"]}><AdminClassroomsPage /></ProtectedRoute>} />

              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AppErrorBoundary>
  </QueryClientProvider>
);

export default App;
