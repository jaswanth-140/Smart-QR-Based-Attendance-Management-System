import { useCallback, useEffect, useRef, useState } from 'react';
import { TopNavbarLayout } from '@/components/layout/TopNavbarLayout';
import { QrScanner, ScanStatus } from '@/components/QrScanner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Wifi, WifiOff, MapPin, Camera, CheckCircle2,
  AlertTriangle, ShieldAlert, Video, VideoOff, Loader2, ImagePlus,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAttendanceStore } from '@/store/attendanceStore';
import { useAuthStore } from '@/store/authStore';
import { getBrowserCoordinates } from '@/lib/geolocation';
import { BackendAttendanceRecord } from '@/lib/backend-types';
import { Html5Qrcode } from 'html5-qrcode';

interface CheckItem {
  icon: React.ElementType;
  label: string;
  checked: boolean;
}

const IMAGE_SCANNER_REGION_ID = 'qr-image-scan-region';

export default function ScanPage() {
  const fallbackCoordinates = { latitude: 17.385, longitude: 78.4867 };
  const { markAttendanceByScan } = useAttendanceStore();
  const { devices } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingLocation, setIsCheckingLocation] = useState(false);
  const [isDecodingImage, setIsDecodingImage] = useState(false);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [checks, setChecks] = useState<CheckItem[]>([
    { icon: Wifi, label: 'College Wi-Fi', checked: true },
    { icon: WifiOff, label: 'Mobile Data OFF', checked: true },
    { icon: MapPin, label: 'Location Enabled', checked: false },
  ]);

  const allChecked = checks
    .filter((item) => item.label !== 'Location Enabled')
    .every((item) => item.checked);
  const canUseLiveCamera = window.isSecureContext;

  const updateLocationCheck = useCallback((checked: boolean) => {
    setChecks((current) =>
      current.map((item) => (item.label === 'Location Enabled' ? { ...item, checked } : item)),
    );
  }, []);

  const resolveLocation = useCallback(
    async (showErrorToast: boolean) => {
      try {
        const position = await getBrowserCoordinates(7000);
        setCoordinates(position);
        updateLocationCheck(true);
        return position;
      } catch (error) {
        setCoordinates(null);
        updateLocationCheck(false);
        if (showErrorToast) {
          const message = error instanceof Error ? error.message : 'Unable to access your current location.';
          toast.error(message);
        }
        return null;
      }
    },
    [updateLocationCheck],
  );

  useEffect(() => {
    let mounted = true;

    void resolveLocation(false).then((position) => {
      if (!mounted || !position) return;
      setCoordinates(position);
    });

    return () => {
      mounted = false;
    };
  }, [resolveLocation]);

  const submitDecodedQr = useCallback(
    async (decodedText: string) => {
      if (isSubmitting) return;

      const device = devices[0];
      if (!device) {
        toast.error('Please register a device in Settings before scanning.');
        setScannerActive(false);
        return;
      }

      setIsSubmitting(true);
      try {
        const parsed = JSON.parse(decodedText) as {
          sessionId?: string | number;
          qrToken?: string;
          latitude?: number;
          longitude?: number;
        };
        if (!parsed.sessionId || !parsed.qrToken) {
          throw new Error('Invalid attendance QR code.');
        }

        let latestCoordinates = coordinates;
        if (!latestCoordinates) {
          try {
            latestCoordinates = await getBrowserCoordinates(5000);
          } catch {
            if (typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
              latestCoordinates = { latitude: parsed.latitude, longitude: parsed.longitude };
            } else {
              latestCoordinates = fallbackCoordinates;
            }
            toast.warning('Location unavailable. Using fallback location for this scan.');
          }
        }
        setCoordinates(latestCoordinates);

        const result: BackendAttendanceRecord = await markAttendanceByScan({
          sessionId: String(parsed.sessionId),
          qrToken: parsed.qrToken,
          latitude: latestCoordinates.latitude,
          longitude: latestCoordinates.longitude,
          deviceHardwareId: `${device.browser}|${device.os}|${device.device_fingerprint}`,
        });

        toast.success('Attendance marked successfully!', {
          description: `${result.session.course.code} - ${result.session.course.name}`,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to mark attendance';
        toast.error(message);
      } finally {
        setIsSubmitting(false);
        setScannerActive(false);
      }
    },
    [coordinates, devices, isSubmitting, markAttendanceByScan],
  );

  const handleQrResult = useCallback(
    (decodedText: string) => {
      void submitDecodedQr(decodedText);
    },
    [submitDecodedQr],
  );

  const handlePhotoScan = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImageSelection = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';

      if (!file) {
        return;
      }

      setIsDecodingImage(true);
      try {
        const imageScanner = new Html5Qrcode(IMAGE_SCANNER_REGION_ID, { verbose: false });
        const decodedText = await imageScanner.scanFile(file, false);
        imageScanner.clear();
        await submitDecodedQr(decodedText);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not decode the QR image.';
        toast.error(message);
      } finally {
        setIsDecodingImage(false);
      }
    },
    [submitDecodedQr],
  );

  const handleStartScan = async () => {
    if (!canUseLiveCamera) {
      toast.error('Live camera scanning requires HTTPS or localhost. Use the photo scan option on this link.');
      return;
    }

    setIsCheckingLocation(true);
    const latestCoordinates = coordinates ?? await resolveLocation(true);
    setIsCheckingLocation(false);

    if (!latestCoordinates) {
      toast.warning('Location is unavailable on this browser/network. Scanner will continue with fallback coordinates.');
    }

    if (!allChecked) {
      toast.error('Complete the pre-scan checklist before scanning attendance.');
      return;
    }

    setScannerActive(true);
  };

  return (
    <TopNavbarLayout>
      <div className="max-w-lg mx-auto space-y-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleImageSelection}
        />
        <div id={IMAGE_SCANNER_REGION_ID} className="hidden" />

        <div className="text-center">
          <h1 className="text-2xl font-bold">
            {scanStatus === 'scanning'
              ? 'Point at QR Code'
              : scanStatus === 'success'
                ? 'Scan Complete!'
                : 'Ready to Scan'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {scanStatus === 'scanning'
              ? 'Align the QR code within the frame below.'
              : scanStatus === 'success'
                ? 'Processing your attendance...'
                : 'Open the scanner and mark attendance as soon as the teacher QR appears.'}
          </p>
        </div>

        {!canUseLiveCamera && !scannerActive && (
          <Card className="border-warning/30 bg-warning/5 shadow-card">
            <CardContent className="p-4 text-sm text-muted-foreground">
              Live camera scanning needs an HTTPS URL or `localhost`. On a phone opened through an HTTP IP link,
              use the QR photo option below or deploy the app to HTTPS.
            </CardContent>
          </Card>
        )}

        {!scannerActive && scanStatus !== 'success' && (
          <Card className="shadow-card">
            <CardContent className="p-5 space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                Pre-Scan Checklist
              </p>
              <div className="space-y-2.5">
                {checks.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/40"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    {item.checked && <CheckCircle2 className="h-5 w-5 text-accent" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {!scannerActive && allChecked && scanStatus !== 'denied' && scanStatus !== 'error' && (
          <div className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-accent/10">
            <CheckCircle2 className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-accent">Ready for live attendance scanning</span>
          </div>
        )}

        {scanStatus === 'denied' && (
          <Card className="shadow-card border-destructive/30">
            <CardContent className="p-6 text-center space-y-3">
              <div className="mx-auto h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
                <ShieldAlert className="h-7 w-7 text-destructive" />
              </div>
              <h3 className="text-lg font-bold text-destructive">Camera Access Denied</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The QR scanner needs camera access to work. Please enable it and try again.
              </p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => {
                  setScannerActive(false);
                  setScanStatus('idle');
                }}
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {scanStatus === 'error' && (
          <Card className="shadow-card border-warning/30">
            <CardContent className="p-6 text-center space-y-3">
              <div className="mx-auto h-14 w-14 rounded-full bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="h-7 w-7 text-warning" />
              </div>
              <h3 className="text-lg font-bold">Scanner Error</h3>
              <p className="text-sm text-muted-foreground">
                Could not access the camera. Make sure no other app is using it, then try again.
              </p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => {
                  setScannerActive(false);
                  setScanStatus('idle');
                }}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {scannerActive && scanStatus !== 'denied' && scanStatus !== 'error' && (
          <Card className="shadow-card overflow-hidden">
            <CardContent className="p-0">
              {scanStatus === 'requesting' && (
                <div className="aspect-square flex flex-col items-center justify-center gap-3 bg-foreground/5">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground font-medium">Requesting camera access...</p>
                </div>
              )}
              <QrScanner
                active={scannerActive}
                onScan={handleQrResult}
                onStatusChange={setScanStatus}
              />
            </CardContent>
          </Card>
        )}

        {!scannerActive && scanStatus !== 'denied' && scanStatus !== 'error' && (
          <Card className="shadow-card overflow-hidden">
            <CardContent className="p-0">
              <div className="relative bg-foreground/90 aspect-[4/3] flex items-center justify-center">
                <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-white/80 rounded-tl-lg" />
                <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-white/80 rounded-tr-lg" />
                <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-white/80 rounded-bl-lg" />
                <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-white/80 rounded-br-lg" />
                <Camera className="h-12 w-12 text-white/20" />
              </div>
            </CardContent>
          </Card>
        )}

        {!scannerActive && scanStatus !== 'denied' && scanStatus !== 'error' && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              size="lg"
              className="w-full gradient-primary text-base py-6 gap-2"
              onClick={() => void handleStartScan()}
              disabled={isSubmitting || isCheckingLocation || !canUseLiveCamera || isDecodingImage}
            >
              <Video className="h-5 w-5" />
              {isSubmitting ? 'Processing...' : isCheckingLocation ? 'Checking Location...' : 'Start Live Scanner'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full text-base py-6 gap-2"
              onClick={handlePhotoScan}
              disabled={isSubmitting || isCheckingLocation || isDecodingImage}
            >
              <ImagePlus className="h-5 w-5" />
              {isDecodingImage ? 'Reading QR Photo...' : 'Scan From Photo'}
            </Button>
          </div>
        )}

        {scannerActive && scanStatus === 'scanning' && (
          <Button
            size="lg"
            variant="outline"
            className="w-full text-base py-6 gap-2 border-destructive/30 text-destructive hover:bg-destructive/5"
            onClick={() => setScannerActive(false)}
          >
            <VideoOff className="h-5 w-5" />
            Stop Scanner
          </Button>
        )}

        <p className="text-center text-sm text-muted-foreground">
          {scannerActive
            ? 'Hold your device steady over the teacher QR code.'
            : canUseLiveCamera
              ? 'Location is preferred, but scan can continue if this browser blocks location on HTTP.'
              : 'Use the photo option on mobile HTTP links, or deploy over HTTPS for live camera scanning.'}
        </p>
      </div>
    </TopNavbarLayout>
  );
}
