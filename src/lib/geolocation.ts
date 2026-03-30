export interface BrowserCoordinates {
  latitude: number;
  longitude: number;
}

export function getBrowserCoordinates(timeout = 5000): Promise<BrowserCoordinates> {
  return new Promise((resolve, reject) => {
    if (!window.isSecureContext) {
      reject(new Error("Location access requires HTTPS or localhost in this browser."));
      return;
    }

    if (!("geolocation" in navigator)) {
      reject(new Error("Location services are not available on this device."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error("Location permission is blocked for this site."));
            return;
          case error.POSITION_UNAVAILABLE:
            reject(new Error("Your current location could not be determined."));
            return;
          case error.TIMEOUT:
            reject(new Error("Location request timed out. Try again in an open area."));
            return;
          default:
            reject(new Error("Unable to access your current location."));
        }
      },
      {
        enableHighAccuracy: true,
        timeout,
        maximumAge: 15000,
      },
    );
  });
}
