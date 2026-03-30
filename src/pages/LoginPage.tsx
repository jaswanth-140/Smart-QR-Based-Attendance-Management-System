import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, UserRole } from '@/store/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { QrCode, GraduationCap, BookOpen, Building2, Lock, Eye, EyeOff, User as UserIcon, BadgeInfo } from 'lucide-react';

const roles: { value: UserRole; label: string; icon: React.ElementType }[] = [
  { value: 'student', label: 'Student', icon: GraduationCap },
  { value: 'teacher', label: 'Teacher', icon: BookOpen },
  { value: 'admin', label: 'Admin', icon: Building2 },
];

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register, authError } = useAuthStore();

  // Students can only login, never signup
  const canSignUp = selectedRole !== 'student';
  const showSignUpForm = !isLogin && canSignUp;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let success = false;
      if (isLogin || selectedRole === 'student') {
        const identifier = selectedRole === 'student' ? studentId : email;
        success = await login(identifier, password, selectedRole);
      } else {
        success = await register(name, email, password, selectedRole, studentId, department);
      }

      if (success) {
        navigate(selectedRole === 'admin' ? '/admin/dashboard' : '/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen safe-bottom" style={{ background: 'linear-gradient(135deg, hsl(220 60% 96%) 0%, hsl(225 60% 92%) 50%, hsl(230 50% 95%) 100%)' }}>
      <header className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-5">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <QrCode className="h-5 w-5 text-primary" />
          </div>
          <span className="text-base font-bold text-foreground sm:text-lg">Smart Attendance Portal</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm sm:justify-end sm:gap-6">
          <button className="text-muted-foreground hover:text-foreground transition-colors">Help Center</button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">Contact Admin</button>
        </div>
      </header>

      <div className="flex items-center justify-center px-3 pb-10 pt-2 sm:px-4 sm:pb-16 sm:pt-8">
        <div className="w-full max-w-[440px]">
          <Card className="shadow-elevated border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-5 sm:p-8">
              <div className="mb-6 text-center sm:mb-8">
                <h1 className="text-xl font-bold sm:text-2xl">
                  {selectedRole === 'student'
                    ? 'Student Login'
                    : showSignUpForm
                      ? 'Create an Account'
                      : 'Welcome Back'}
                </h1>
                <p className="text-muted-foreground text-sm mt-1.5">
                  {selectedRole === 'student'
                    ? 'Sign in with your User ID and password.'
                    : showSignUpForm
                      ? 'Sign up to get started with Smart Attendance Hub.'
                      : 'Sign in to manage your attendance and view reports.'}
                </p>
              </div>

              <div className="mb-6 grid grid-cols-3 overflow-hidden rounded-xl border sm:mb-8">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => {
                      setSelectedRole(role.value);
                      if (role.value === 'student') setIsLogin(true);
                    }}
                    className={`flex min-w-0 items-center justify-center gap-1.5 px-2 py-3 text-xs font-medium transition-all sm:gap-2 sm:text-sm ${selectedRole === role.value
                        ? 'bg-white text-primary shadow-sm'
                        : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    <role.icon className="h-4 w-4" />
                    {role.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name — signup only (teacher/admin) */}
                {showSignUpForm && (
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Full Name
                    </Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Department — signup only (teacher) */}
                {showSignUpForm && selectedRole === 'teacher' && (
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Department
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="department"
                        type="text"
                        placeholder="e.g. Computer Science"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="pl-10 h-11"
                      />
                    </div>
                  </div>
                )}

                {/* Student ID — student login only */}
                {selectedRole === 'student' && (
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      User ID
                    </Label>
                    <div className="relative">
                      <BadgeInfo className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="studentId"
                        type="text"
                        placeholder="e.g. 2410030001"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Email — teacher/admin only */}
                {selectedRole !== 'student' && (
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Email
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@university.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Password
                    </Label>
                    <button type="button" className="text-xs text-primary hover:underline font-medium">
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {authError && <p className="text-sm text-destructive">{authError}</p>}

                <Button type="submit" className="w-full h-12 gradient-primary text-sm font-semibold gap-2" disabled={loading}>
                  {loading
                    ? (showSignUpForm ? 'Registering...' : 'Signing in...')
                    : (showSignUpForm ? 'Sign Up' : 'Login')}
                  {!loading && <span>→</span>}
                </Button>

                {/* Signup toggle — only for teacher/admin */}
                {canSignUp && (
                  <div className="text-center mt-6 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                      <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-primary font-semibold hover:underline"
                      >
                        {isLogin ? 'Sign Up' : 'Sign In'}
                      </button>
                    </p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
