import { NavLink as RouterNavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { LayoutDashboard, CalendarCheck, Settings, ScanLine, LogOut, QrCode, ChevronRight } from 'lucide-react';

interface StudentSidebarLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: { label: string; to?: string }[];
    title?: string;
    subtitle?: string;
}

const sidebarNav = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'My Attendance', to: '/my-attendance', icon: CalendarCheck },
    { label: 'Scan QR', to: '/scan', icon: ScanLine },
    { label: 'Settings', to: '/settings', icon: Settings },
];

export function StudentSidebarLayout({ children, breadcrumbs, title, subtitle }: StudentSidebarLayoutProps) {
    const { user, logout } = useAuthStore();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex bg-background">
            {/* Sidebar */}
            <aside className="w-[240px] bg-white border-r border-border/60 flex flex-col shrink-0">
                {/* Brand */}
                <div className="px-5 py-5">
                    <RouterNavLink to="/dashboard" className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                            <QrCode className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-foreground leading-tight">Smart Attendance</p>
                            <p className="text-[11px] text-muted-foreground">Student Portal</p>
                        </div>
                    </RouterNavLink>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 space-y-0.5">
                    {sidebarNav.map((item) => {
                        const isActive = location.pathname === item.to;
                        return (
                            <RouterNavLink
                                key={item.label}
                                to={item.to}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-primary/8 text-primary'
                                    : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                                    }`}
                            >
                                <item.icon className="h-[18px] w-[18px]" />
                                {item.label}
                            </RouterNavLink>
                        );
                    })}
                </nav>

                {/* Footer: Logout */}
                <div className="px-3 py-4 border-t border-border/60">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors w-full"
                    >
                        <LogOut className="h-[18px] w-[18px]" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 min-w-0 overflow-auto">
                <div className="max-w-5xl mx-auto px-8 py-8">
                    {/* Breadcrumbs */}
                    {breadcrumbs && breadcrumbs.length > 0 && (
                        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                            {breadcrumbs.map((crumb, i) => (
                                <span key={i} className="flex items-center gap-1.5">
                                    {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
                                    {crumb.to ? (
                                        <RouterNavLink to={crumb.to} className="hover:text-foreground transition-colors">
                                            {crumb.label}
                                        </RouterNavLink>
                                    ) : (
                                        <span className="text-foreground font-medium">{crumb.label}</span>
                                    )}
                                </span>
                            ))}
                        </nav>
                    )}

                    {/* Page Title */}
                    {title && (
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                            {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
                        </div>
                    )}

                    {children}
                </div>
            </div>
        </div>
    );
}
