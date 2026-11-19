export interface UserCoordinates {
  lat: number;
  lng: number;
}

export type LocationFailureReason = 'insecure' | 'unsupported' | 'denied' | 'unavailable' | 'timeout';

export type LocationRequest =
  | { ok: true; coords: UserCoordinates }
  | { ok: false; reason: LocationFailureReason; title: string; message: string };

interface LocationEnv {
  userAgent?: string;
  secureContext?: boolean;
  geolocation?: Geolocation | null;
  maxTouchPoints?: number;
}

const OPEN_IN_BROWSER = 'Nhấn menu (⋯ hoặc mũi tên chia sẻ) và chọn “Mở bằng Safari” trên iPhone, hoặc “Mở bằng Chrome” trên Android. Rồi nhấn lại nút vị trí.';

export const CYCLING_STORY_LOCATION_MESSAGE = 'Chưa có vị trí của bạn để vẽ hành trình. Nhấn “Vị trí của tôi” và chọn Cho phép khi trình duyệt hỏi. Nếu không thấy hộp hỏi, mở trang bằng Safari hoặc Chrome.';

// Threads on iOS reports itself as Barcelona and also includes Instagram.
export function inAppBrowserName(userAgent: string): string | null {
  if (/Zalo/i.test(userAgent)) return 'Zalo';
  if (/Barcelona|\bThreads\b/i.test(userAgent)) return 'Threads';
  if (/Instagram/i.test(userAgent)) return 'Instagram';
  if (/Messenger/i.test(userAgent)) return 'Messenger';
  if (/FBAN|FBAV|FB_IAB|FBIOS/i.test(userAgent)) return 'Facebook';
  return null;
}

function isIosDevice(userAgent: string, maxTouchPoints: number): boolean {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return true;
  return /Macintosh/i.test(userAgent) && maxTouchPoints > 1;
}

export function locationFailureCopy(
  reason: LocationFailureReason,
  userAgent: string,
  maxTouchPoints = 0,
): { title: string; message: string } {
  const inApp = inAppBrowserName(userAgent);
  if (inApp && reason !== 'insecure') {
    return {
      title: `${inApp} không hiện hộp hỏi vị trí`,
      message: `Trình duyệt trong ${inApp} thường không hiện hộp xin quyền vị trí.\n\n${OPEN_IN_BROWSER}`,
    };
  }

  switch (reason) {
    case 'insecure':
      return {
        title: 'Cần mở trang bằng HTTPS',
        message: 'Trình duyệt chỉ hỏi quyền vị trí trên kết nối bảo mật. Hãy mở https://chupgibaygio.com rồi nhấn lại nút vị trí.',
      };
    case 'unsupported':
      return {
        title: 'Trình duyệt này không dùng được vị trí',
        message: `Trang không xin được vị trí trên trình duyệt này.\n\n${OPEN_IN_BROWSER}`,
      };
    case 'denied':
      return isIosDevice(userAgent, maxTouchPoints)
        ? {
            title: 'Quyền vị trí đang bị tắt',
            message: 'iPhone không hiện lại hộp hỏi nếu bạn đã từ chối trước đó.\n\nVào Cài đặt → Quyền riêng tư và bảo mật → Dịch vụ định vị và bật Định vị. Sau đó vào Cài đặt → Safari → Vị trí, chọn “Hỏi” hoặc “Khi dùng ứng dụng”. Tải lại trang rồi nhấn nút vị trí.',
          }
        : {
            title: 'Quyền vị trí đang bị tắt',
            message: 'Trình duyệt không hiện lại hộp hỏi nếu vị trí đã bị chặn.\n\nNhấn biểu tượng ổ khóa cạnh thanh địa chỉ → Quyền → Vị trí → Cho phép. Bật Định vị trong Cài đặt của máy, tải lại trang, rồi nhấn nút vị trí.',
          };
    case 'timeout':
    case 'unavailable':
      return {
        title: 'Chưa lấy được vị trí',
        message: 'Hãy bật Định vị (GPS) của máy và thử lại ở chỗ thoáng. Nếu không thấy hộp hỏi quyền, mở trang bằng Safari hoặc Chrome rồi nhấn lại nút vị trí.',
      };
  }
}

function failure(reason: LocationFailureReason, userAgent: string, maxTouchPoints: number): LocationRequest {
  return { ok: false, reason, ...locationFailureCopy(reason, userAgent, maxTouchPoints) };
}

/**
 * Starts the browser location request before returning.
 * Mobile browsers only show the permission prompt when getCurrentPosition
 * runs inside the tap, so callers must invoke this directly from the click
 * handler and must not await anything first.
 */
export function requestUserLocation(env: LocationEnv = {}): Promise<LocationRequest> {
  const userAgent = env.userAgent ?? (typeof navigator === 'undefined' ? '' : navigator.userAgent);
  const maxTouchPoints = env.maxTouchPoints ?? (typeof navigator === 'undefined' ? 0 : navigator.maxTouchPoints || 0);
  // Only an explicit false is insecure. Older webviews omit isSecureContext;
  // treating that as blocked would skip the permission prompt entirely.
  const secure = env.secureContext !== undefined
    ? env.secureContext
    : typeof window === 'undefined' || window.isSecureContext !== false;
  const geolocation = env.geolocation !== undefined
    ? env.geolocation
    : (typeof navigator === 'undefined' ? null : navigator.geolocation);

  if (!secure) return Promise.resolve(failure('insecure', userAgent, maxTouchPoints));
  if (!geolocation || typeof geolocation.getCurrentPosition !== 'function') {
    return Promise.resolve(failure('unsupported', userAgent, maxTouchPoints));
  }

  return new Promise((resolve) => {
    let settled = false;
    let watchdog = 0;
    const finish = (result: LocationRequest) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(watchdog);
      resolve(result);
    };

    // Some in-app webviews never call either callback and ignore the API timeout.
    watchdog = window.setTimeout(() => finish(failure('timeout', userAgent, maxTouchPoints)), 21_000);

    try {
      geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            finish(failure('unavailable', userAgent, maxTouchPoints));
            return;
          }
          finish({ ok: true, coords: { lat, lng } });
        },
        (error) => {
          const code = error?.code;
          const reason: LocationFailureReason = code === 1 ? 'denied' : code === 3 ? 'timeout' : 'unavailable';
          finish(failure(reason, userAgent, maxTouchPoints));
        },
        { enableHighAccuracy: true, timeout: 20_000, maximumAge: 60_000 },
      );
    } catch {
      finish(failure('unsupported', userAgent, maxTouchPoints));
    }
  });
}
