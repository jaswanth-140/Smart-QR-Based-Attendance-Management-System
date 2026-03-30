import { useState } from 'react';
import { TopNavbarLayout } from '@/components/layout/TopNavbarLayout';
import { TeacherTopNavbarLayout } from '@/components/layout/TeacherTopNavbarLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { Smartphone, Laptop, Tablet, Trash2, Plus, FileText, AlertTriangle, Pencil, Mail, IdCard } from 'lucide-react';
import { toast } from 'sonner';
import { NewDeviceModal } from '@/components/NewDeviceModal';
import { MAX_DEVICE_SLOTS } from '@/lib/deviceSlots';

const deviceIcons: Record<string, React.ElementType> = {
  'iPhone 15 Pro': Smartphone,
  'MacBook Pro': Laptop,
  'iPad Air': Tablet,
};

export default function SettingsPage() {
  const { user, devices, removeDevice, isLoadingDevices } = useAuthStore();
  const [twoFA, setTwoFA] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const maxDeviceSlots = MAX_DEVICE_SLOTS;
  const deviceSlotsUsed = devices.length;
  const deviceSlotsPercent = Math.min(100, (deviceSlotsUsed / maxDeviceSlots) * 100);

  const handleDeviceRemove = async (deviceId: string) => {
    try {
      await removeDevice(deviceId);
      toast.success('Device removed');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove device';
      toast.error(message);
    }
  };

  const isStudent = user?.role === 'student';

  const Layout = isStudent ? TopNavbarLayout : TeacherTopNavbarLayout;

  return (
    <Layout>
      <div className="space-y-8 max-w-6xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account & Device Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your profile, trusted devices, and security preferences.</p>
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Left Column: Profile */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="shadow-card">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <button className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
              <h3 className="text-lg font-semibold">{user?.name || 'Alex Thompson'}</h3>
              <p className="text-sm text-primary font-medium">{user?.department || 'Computer Science'} Dept.</p>

              <div className="w-full mt-5 space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40">
                  <IdCard className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="text-left">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{isStudent ? 'Student ID' : 'Employee ID'}</p>
                    <p className="text-sm font-medium">{user?.studentId || (isStudent ? 'STU-2023-8891' : 'N/A')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="text-left">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">College Email</p>
                    <p className="text-sm font-medium">{user?.email || 'alex.t@university.edu'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card className="shadow-card">
            <CardContent className="p-5">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Support</p>
              <div className="space-y-2">
                <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-secondary/50 transition-colors text-left">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Attendance Policy</span>
                </button>
                <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-secondary/50 transition-colors text-left">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="text-sm font-medium">Report an Issue</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Devices + Security */}
        <div className="space-y-6">
          {/* Registered Devices — Student only */}
          {isStudent && (
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Registered Devices</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">Manage devices authorized for QR attendance.</p>
              </div>
              <Button
                className="gradient-primary gap-1.5"
                size="sm"
                onClick={() => setShowDeviceModal(true)}
                disabled={deviceSlotsUsed >= maxDeviceSlots}
              >
                <Plus className="h-4 w-4" /> Register Device
              </Button>
            </CardHeader>
            <CardContent>
              {/* Device Slots */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Device Slots Used</span>
                  <span className="text-sm font-semibold text-primary">{deviceSlotsUsed} / {maxDeviceSlots}</span>
                </div>
                <Progress value={deviceSlotsPercent} className="h-2" />
              </div>

              {/* Device List */}
              <div className="space-y-3">
                {isLoadingDevices && <p className="text-sm text-muted-foreground">Loading devices...</p>}
                {!isLoadingDevices && devices.length === 0 && (
                  <p className="text-sm text-muted-foreground">No devices registered yet.</p>
                )}
                {!isLoadingDevices && devices.map((device, index) => (
                  <div key={device.id} className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/30 border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center border border-border/50">
                        <Smartphone className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{device.device_name}</p>
                          {index === 0 && (
                            <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">CURRENT</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Last active: {new Date(device.last_active).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{device.browser} • {device.os}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive h-8 w-8"
                        onClick={() => void handleDeviceRemove(device.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          )}

          {/* Login & Security */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Login & Security</CardTitle>
              <p className="text-sm text-muted-foreground">Update your password and secure your account.</p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Current Password</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">New Password</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Confirm New Password</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
              </div>

              {/* 2FA */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Two-Factor Authentication</p>
                    <p className="text-xs text-muted-foreground">Add an extra layer of security to your account.</p>
                  </div>
                </div>
                <Switch checked={twoFA} onCheckedChange={setTwoFA} />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline">Cancel</Button>
                <Button className="gradient-primary" onClick={() => toast.success('Changes saved')}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>

      <NewDeviceModal open={showDeviceModal} onOpenChange={setShowDeviceModal} />
    </Layout>
  );
}
