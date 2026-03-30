import { NavLink } from '@/components/NavLink';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard, CalendarCheck, Settings, HelpCircle,
  QrCode, Users, BookOpen, ClipboardList, FileBarChart,
  Shield, Building, LogOut, GraduationCap, Camera, Smartphone
} from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';

const studentNav = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Scan QR', url: '/scan', icon: Camera },
  { title: 'My Attendance', url: '/my-attendance', icon: CalendarCheck },
  { title: 'Devices', url: '/settings', icon: Smartphone },
  { title: 'Settings', url: '/settings', icon: Settings },
  { title: 'Help', url: '/help', icon: HelpCircle },
];

const teacherNav = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'My Classes', url: '/classes', icon: BookOpen },
  { title: 'Attendance', url: '/attendance', icon: ClipboardList },
  { title: 'Override', url: '/override', icon: Shield },
  { title: 'Reports', url: '/reports', icon: FileBarChart },
  { title: 'Settings', url: '/settings', icon: Settings },
];

const adminNav = [
  { title: 'Dashboard', url: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Students', url: '/admin/students', icon: GraduationCap },
  { title: 'Teachers', url: '/admin/teachers', icon: Users },
  { title: 'Courses', url: '/admin/courses', icon: BookOpen },
  { title: 'Classrooms', url: '/admin/classrooms', icon: Building },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = user?.role === 'admin' ? adminNav : user?.role === 'teacher' ? teacherNav : studentNav;

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 px-4 pt-6 pb-2">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                  <QrCode className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-sidebar-foreground">Smart Attendance</p>
                  <p className="text-xs text-sidebar-foreground/50 capitalize">{user?.role} Portal</p>
                </div>
              </div>
            )}
            {collapsed && (
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center mx-auto">
                <QrCode className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-4">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/dashboard' || item.url === '/admin/dashboard'}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-sidebar border-t border-sidebar-border p-3">
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-medium text-sidebar-accent-foreground">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="text-destructive hover:bg-destructive/10">
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
