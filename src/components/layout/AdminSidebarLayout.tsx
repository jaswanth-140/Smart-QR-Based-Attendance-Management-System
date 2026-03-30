import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { LayoutDashboard, BookOpen, GraduationCap, Users, Bell, HelpCircle, Building, LogOut, Menu, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface AdminSidebarLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: { label: string; to?: string }[];
}

const sidebarNav = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Students", to: "/admin/students", icon: GraduationCap },
  { label: "Teachers", to: "/admin/teachers", icon: Users },
  { label: "Courses", to: "/admin/courses", icon: BookOpen },
  { label: "Classrooms", to: "/admin/classrooms", icon: Building },
];

export function AdminSidebarLayout({ children, breadcrumbs }: AdminSidebarLayoutProps) {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const renderNav = (mode: "desktop" | "mobile") => (
    <nav className={mode === "desktop" ? "flex-1 space-y-1 px-3" : "space-y-1"}>
      {sidebarNav.map((item) => {
        const isActive = location.pathname === item.to;
        return (
          <RouterNavLink
            key={item.label}
            to={item.to}
            className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : mode === "desktop"
                  ? "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  : "bg-secondary/50 text-foreground hover:bg-secondary"
            }`}
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
          </RouterNavLink>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="hidden w-[268px] shrink-0 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col">
        <div className="px-5 py-6">
          <RouterNavLink to="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sidebar-primary/15 text-sidebar-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-bold tracking-tight text-sidebar-accent-foreground">UniAdmin</p>
              <p className="text-xs uppercase tracking-[0.22em] text-sidebar-foreground/60">Control Center</p>
            </div>
          </RouterNavLink>
        </div>
        <div className="px-5 pb-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sidebar-foreground/55">Main Menu</p>
        </div>
        {renderNav("desktop")}
        <div className="mt-auto border-t border-sidebar-border px-4 py-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-primary/15 text-sm font-semibold text-sidebar-primary">
                {user?.name?.charAt(0) || "A"}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-sidebar bg-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-sidebar-accent-foreground">{user?.name || "Admin"}</p>
              <p className="truncate text-xs text-sidebar-foreground/60">{user?.department || "Operations"}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start rounded-2xl px-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-border/60 bg-background/88 px-4 py-4 backdrop-blur-xl sm:px-6">
          <div className="page-grid flex items-center justify-between gap-4 px-0">
            <div className="flex min-w-0 items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open admin navigation</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="border-r border-border/70 bg-background/98">
                  <SheetHeader>
                    <SheetTitle>UniAdmin</SheetTitle>
                    <SheetDescription>Administrative navigation and system tools.</SheetDescription>
                  </SheetHeader>
                  <div className="mt-8">{renderNav("mobile")}</div>
                  <Button
                    variant="outline"
                    className="mt-6 w-full justify-start rounded-2xl"
                    onClick={logout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                </SheetContent>
              </Sheet>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Administrative tools</p>
                {breadcrumbs && breadcrumbs.length > 0 && (
                  <nav className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                    {breadcrumbs.map((crumb, i) => (
                      <span key={i} className="flex items-center gap-1.5">
                        {i > 0 && <span className="text-muted-foreground/50">/</span>}
                        {crumb.to ? (
                          <RouterNavLink to={crumb.to} className="transition-colors hover:text-foreground">
                            {crumb.label}
                          </RouterNavLink>
                        ) : (
                          <span className="font-semibold text-foreground">{crumb.label}</span>
                        )}
                      </span>
                    ))}
                  </nav>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative hidden sm:inline-flex">
                <Bell className="h-[18px] w-[18px] text-muted-foreground" />
                <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 px-1 text-[9px]">1</Badge>
              </Button>
              <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
                <HelpCircle className="h-[18px] w-[18px] text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
                <Settings className="h-[18px] w-[18px] text-muted-foreground" />
              </Button>
            </div>
          </div>
        </header>

        <main className="page-grid flex-1 py-8 md:py-10">{children}</main>
      </div>
    </div>
  );
}
