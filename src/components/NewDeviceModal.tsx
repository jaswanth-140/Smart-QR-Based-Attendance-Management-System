import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Smartphone, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { MAX_DEVICE_SLOTS } from '@/lib/deviceSlots';
import { toast } from 'sonner';

interface NewDeviceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewDeviceModal({ open, onOpenChange }: NewDeviceModalProps) {
  const { devices, addDevice } = useAuthStore();
  const [deviceName, setDeviceName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const slotsUsed = devices.length;
  const maxSlots = MAX_DEVICE_SLOTS;
  const remaining = Math.max(0, maxSlots - slotsUsed);
  const slotsPercent = Math.min(100, (slotsUsed / maxSlots) * 100);

  const handleRegister = async () => {
    if (!deviceName.trim()) {
      toast.error('Please enter a device name');
      return;
    }
    if (slotsUsed >= maxSlots) {
      toast.error('Maximum devices reached. Remove a device first.');
      return;
    }
    setIsSubmitting(true);
    try {
      await addDevice({
        device_name: deviceName,
        browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Browser',
        os: navigator.platform || 'Unknown OS',
        last_active: new Date().toISOString(),
        device_fingerprint: `fp_${Date.now()}`,
      });
      toast.success('Device registered successfully');
      setDeviceName('');
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not register device';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Smartphone className="h-8 w-8 text-primary" />
          </div>
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl">New Device Detected</DialogTitle>
            <DialogDescription className="mt-2">
              We don't recognize this device. To maintain account security, please verify your quota and name this device to continue.
            </DialogDescription>
          </DialogHeader>

          {/* Slots */}
          <div className="w-full p-4 rounded-lg border bg-secondary/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Device Slots Used</span>
              <span className="text-sm font-bold text-primary">{slotsUsed}/{maxSlots}</span>
            </div>
            <Progress value={slotsPercent} className="h-2" />
            <p className="text-xs text-muted-foreground">
              You have {remaining} slot{remaining === 1 ? '' : 's'} remaining.
            </p>
          </div>

          {/* Device Name */}
          <div className="w-full text-left space-y-2">
            <label className="text-sm font-medium">Device Name</label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="e.g. John's iPhone 13"
                className="pl-9"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button className="flex-1 gradient-primary" onClick={() => void handleRegister()} disabled={slotsUsed >= maxSlots || isSubmitting}>
              Register Device <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
