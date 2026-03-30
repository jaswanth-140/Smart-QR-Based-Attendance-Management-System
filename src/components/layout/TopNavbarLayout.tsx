import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Bell, HelpCircle, LogOut, Menu, QrCode, ScanLine, Settings, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface TopNavbarLayoutProps {
  children: React.ReactNode;
  navItems?: { label: string; to: string }[];
  brandName?: string;
}

const defaultStudentNav = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Attendance", to: "/my-attendance" },
  { label: "Scan QR", to: "/scan" },
  { label: "Help", to: "/help" },
  { label: "Settings", to: "/settings" },
];

export function TopNavbarLayout({
  children,
  navItems,
  brandName = "Smart Attendance",
}: TopNavbarLayoutProps) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const items = navItems || defaultStudentNav;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/88 backdrop-blur-xl">
        <div className="page-grid flex h-16 items-center justify-between gap-2 sm:h-20 sm:gap-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open student navigation</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="border-r border-border/70 bg-background/98">
                <SheetHeader>
                  <SheetTitle>{brandName}</SheetTitle>
                  <SheetDescription>Navigate your student workspace.</SheetDescription>
                </SheetHeader>
                <nav className="mt-8 space-y-2">
                  {items.map((item) => {
                    const isActive = location.pathname === item.to;
                    return (
                      <RouterNavLink
                        key={item.label}
                        to={item.to}
                        className={`flex items-center rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary/50 text-foreground hover:bg-secondary"
                        }`}
                      >
                        {item.label}
                      </RouterNavLink>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>

            <RouterNavLink to="/dashboard" className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:h-11 sm:w-11">
                <QrCode className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold tracking-tight sm:text-base">{brandName}</p>
                <p className="hidden text-xs uppercase tracking-[0.22em] text-muted-foreground sm:block">Student Workspace</p>
              </div>
            </RouterNavLink>
          </div>

          <nav className="hidden items-center gap-2 rounded-full border border-border/60 bg-card/80 px-2 py-1 md:flex">
            {items.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <RouterNavLink
                  key={item.label}
                  to={item.to}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {item.label}
                </RouterNavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button variant="ghost" size="icon" className="relative hidden sm:inline-flex">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 px-1 text-[9px]">2</Badge>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 rounded-full border border-border/60 bg-card/80 px-1.5 sm:h-11 sm:px-3"
                >
                  <div className="mr-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary sm:mr-2">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      user?.name?.charAt(0) || "U"
                    )}
                  </div>
                  <div className="hidden text-left sm:block">
                    <p className="max-w-[10rem] truncate text-sm font-semibold text-foreground">
                      {user?.name || "Student"}
                    </p>
                    <p className="text-xs text-muted-foreground">Attendance profile</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <RouterNavLink to="/dashboard" className="flex w-full items-center">
                    <UserRound className="mr-2 h-4 w-4" />
                    Dashboard
                  </RouterNavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <RouterNavLink to="/scan" className="flex w-full items-center">
                    <ScanLine className="mr-2 h-4 w-4" />
                    Scan QR
                  </RouterNavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <RouterNavLink to="/help" className="flex w-full items-center">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Help Center
                  </RouterNavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <RouterNavLink to="/settings" className="flex w-full items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </RouterNavLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="page-grid safe-bottom py-5 sm:py-8 md:py-10">{children}</main>
    </div>
  );
}
