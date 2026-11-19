// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { inAppBrowserName, requestUserLocation } from './userLocation';

const position = {
  coords: { latitude: 21.0285, longitude: 105.8542 },
} as GeolocationPosition;

function deny(error: PositionErrorCallback | null | undefined) {
  error?.({ code: 1, message: 'denied', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError);
}

afterEach(() => {
  vi.useRealTimers();
});

describe('inAppBrowserName', () => {
  it('recognizes the in-app browsers that do not show a location prompt', () => {
    expect(inAppBrowserName('Mozilla/5.0 Instagram 302.0')).toBe('Instagram');
    expect(inAppBrowserName('Mozilla/5.0 Instagram Barcelona')).toBe('Threads');
    expect(inAppBrowserName('Mozilla/5.0 FBAN/FBIOS')).toBe('Facebook');
    expect(inAppBrowserName('Zalo android/240600')).toBe('Zalo');
    expect(inAppBrowserName('Mozilla/5.0 Chrome/120.0 Mobile Safari')).toBeNull();
  });
});

describe('requestUserLocation', () => {
  it('calls getCurrentPosition before the function yields, so a tap can show the prompt', () => {
    let called = false;
    const pending = requestUserLocation({
      secureContext: true,
      userAgent: 'Mozilla/5.0 (Linux; Android 14) Chrome/120.0 Mobile',
      geolocation: {
        getCurrentPosition: () => { called = true; },
        watchPosition: () => 0,
        clearWatch: () => undefined,
      },
    });
    expect(called).toBe(true);
    void pending;
  });

  it('returns the coordinates when the browser grants the prompt', async () => {
    const result = await requestUserLocation({
      secureContext: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) Safari',
      geolocation: {
        getCurrentPosition: (success) => success(position),
        watchPosition: () => 0,
        clearWatch: () => undefined,
      },
    });
    expect(result).toEqual({ ok: true, coords: { lat: 21.0285, lng: 105.8542 } });
  });

  it('explains how to turn location back on after a previous denial', async () => {
    const ios = await requestUserLocation({
      secureContext: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) Version/17.5 Mobile/15E148 Safari',
      geolocation: { getCurrentPosition: (_success, error) => deny(error), watchPosition: () => 0, clearWatch: () => undefined },
    });
    expect(ios.ok).toBe(false);
    if (!ios.ok) {
      expect(ios.reason).toBe('denied');
      expect(ios.title).toBe('Quyền vị trí đang bị tắt');
      expect(ios.message).toContain('Cài đặt → Safari → Vị trí');
    }

    const android = await requestUserLocation({
      secureContext: true,
      userAgent: 'Mozilla/5.0 (Linux; Android 14) Chrome/120.0 Mobile',
      geolocation: { getCurrentPosition: (_success, error) => deny(error), watchPosition: () => 0, clearWatch: () => undefined },
    });
    expect(android.ok).toBe(false);
    if (!android.ok) expect(android.message).toContain('Quyền → Vị trí → Cho phép');
  });

  it('tells in-app browsers to open Safari or Chrome instead of waiting for a prompt', async () => {
    const result = await requestUserLocation({
      secureContext: true,
      userAgent: 'Mozilla/5.0 (iPhone) Instagram 350.0.0 Barcelona',
      geolocation: { getCurrentPosition: (_success, error) => deny(error), watchPosition: () => 0, clearWatch: () => undefined },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.title).toContain('Threads');
      expect(result.message).toContain('Mở bằng Safari');
      expect(result.message).toContain('Mở bằng Chrome');
    }
  });

  it('explains an insecure page and a browser with no geolocation API', async () => {
    const insecure = await requestUserLocation({ secureContext: false, userAgent: 'Safari', geolocation: null });
    expect(insecure.ok).toBe(false);
    if (!insecure.ok) {
      expect(insecure.reason).toBe('insecure');
      expect(insecure.message).toContain('https://chupgibaygio.com');
    }

    const missing = await requestUserLocation({
      secureContext: true,
      userAgent: 'Mozilla/5.0 (Linux; Android 14) Chrome/120.0 Mobile',
      geolocation: null,
    });
    expect(missing.ok).toBe(false);
    if (!missing.ok) {
      expect(missing.reason).toBe('unsupported');
      expect(missing.message).toContain('Safari');
    }
  });

  it('stops waiting when an in-app webview never answers', async () => {
    vi.useFakeTimers();
    const pending = requestUserLocation({
      secureContext: true,
      userAgent: 'Zalo android/240600',
      geolocation: { getCurrentPosition: () => undefined, watchPosition: () => 0, clearWatch: () => undefined },
    });
    await vi.advanceTimersByTimeAsync(21_000);
    const result = await pending;
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('timeout');
      expect(result.title).toContain('Zalo');
      expect(result.message).toContain('Chrome');
    }
  });
});
