import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';

export type ScanStatus = 'idle' | 'requesting' | 'scanning' | 'success' | 'denied' | 'error';

interface QrScannerProps {
  onScan: (decodedText: string) => void;
  active: boolean;
  onStatusChange?: (status: ScanStatus) => void;
}

const SCANNER_REGION_ID = 'qr-scanner-region';

export function QrScanner({ onScan, active, onStatusChange }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasScannedRef = useRef(false);
  const [status, setStatus] = useState<ScanStatus>('idle');

  const updateStatus = useCallback(
    (s: ScanStatus) => {
      setStatus(s);
      onStatusChange?.(s);
    },
    [onStatusChange],
  );

  useEffect(() => {
    if (!active) {
      // Stop scanner if it's running and active becomes false
      const scanner = scannerRef.current;
      if (scanner) {
        const state = scanner.getState();
        if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
          scanner.stop().catch(() => { /* ignore cleanup errors */ });
        }
      }
      hasScannedRef.current = false;
      updateStatus('idle');
      return;
    }

    // Start scanning
    const scanner = new Html5Qrcode(SCANNER_REGION_ID, { verbose: false });
    scannerRef.current = scanner;
    hasScannedRef.current = false;
    updateStatus('requesting');

    scanner
      .start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false,
        },
        (decodedText) => {
          // Prevent duplicate callbacks
          if (hasScannedRef.current) return;
          hasScannedRef.current = true;
          updateStatus('success');
          onScan(decodedText);
        },
        () => {
          // Ignore scan failures (scanning continues)
        },
      )
      .then(() => {
        updateStatus('scanning');
      })
      .catch((err: Error) => {
        const msg = err?.message?.toLowerCase() ?? '';
        if (msg.includes('permission') || msg.includes('denied') || msg.includes('notallowed')) {
          updateStatus('denied');
        } else {
          updateStatus('error');
        }
      });

    return () => {
      const state = scanner.getState();
      if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
        scanner.stop().catch(() => { /* ignore cleanup errors */ });
      }
    };
  }, [active, onScan, updateStatus]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-black">
      <div id={SCANNER_REGION_ID} className="w-full" />

      {/* Corner overlays when actively scanning */}
      {status === 'scanning' && (
        <>
          <div className="absolute top-4 left-4 w-10 h-10 border-t-[3px] border-l-[3px] border-white/80 rounded-tl-lg pointer-events-none z-10" />
          <div className="absolute top-4 right-4 w-10 h-10 border-t-[3px] border-r-[3px] border-white/80 rounded-tr-lg pointer-events-none z-10" />
          <div className="absolute bottom-4 left-4 w-10 h-10 border-b-[3px] border-l-[3px] border-white/80 rounded-bl-lg pointer-events-none z-10" />
          <div className="absolute bottom-4 right-4 w-10 h-10 border-b-[3px] border-r-[3px] border-white/80 rounded-br-lg pointer-events-none z-10" />
          {/* Scanning animation line */}
          <div className="absolute left-[10%] right-[10%] h-0.5 bg-primary/80 animate-pulse z-10 top-1/2" />
        </>
      )}
    </div>
  );
}
