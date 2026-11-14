// Everything about getting the app onto a phone: the browser's own install prompt,
// the Android APK download, and telling an installed APK that a newer one exists.
import { Capacitor } from '@capacitor/core';
import { useEffect, useState } from 'react';

export const SITE_URL = 'https://sheldonothomas1-cyber.github.io/chemcsec/';
export const PRIVACY_URL = 'https://sheldonothomas1-cyber.github.io/chemcsec/privacy.html';
export const APK_URL = 'https://github.com/sheldonothomas1-cyber/chemcsec/releases/latest/download/ChemCSEC.apk';
const LATEST_RELEASE_API = 'https://api.github.com/repos/sheldonothomas1-cyber/chemcsec/releases/latest';

/** True inside the Android app built from this code (the APK), false in a browser. */
export const isNativeApp = Capacitor.isNativePlatform();

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Chrome fires this once, early, often before React has mounted - so catch it here.
let deferred: InstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as InstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    installed = true;
    notify();
  });
}

export type Platform = 'android' | 'ios' | 'desktop';
export function platform(): Platform {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'android';
  // iPadOS reports itself as a Mac, but only touch devices have several touch points.
  if (/iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  return 'desktop';
}

/** Already running as an installed app (home-screen web app or the APK)? */
export function isInstalled(): boolean {
  return isNativeApp || installed || window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;
}

export function useInstall() {
  const [, bump] = useState(0);
  useEffect(() => {
    const l = () => bump((n) => n + 1);
    listeners.add(l);
    return () => void listeners.delete(l);
  }, []);
  return {
    platform: platform(),
    installed: isInstalled(),
    /** The browser is ready to show its own install dialog. */
    canPrompt: !!deferred,
    async prompt(): Promise<boolean> {
      if (!deferred) return false;
      const event = deferred;
      await event.prompt();
      const { outcome } = await event.userChoice;
      deferred = null; // a prompt event can only be used once
      notify();
      return outcome === 'accepted';
    },
  };
}

const APK_CHECK_KEY = 'chemcsec:apk-available';

/**
 * Has an APK actually been released? The download link is only shown when it has, so nobody
 * taps a dead link. Checked against GitHub at most once a day; the last answer is remembered.
 */
export function useApkAvailable(): boolean {
  const read = (): { t: number; ok: boolean } | null => {
    try {
      return JSON.parse(localStorage.getItem(APK_CHECK_KEY) ?? 'null');
    } catch {
      return null;
    }
  };
  const [ok, setOk] = useState(() => read()?.ok ?? false);
  useEffect(() => {
    const cached = read();
    // A "yes" is trusted for a day; a "no" is rechecked after ten minutes.
    const fresh = cached && Date.now() - cached.t < (cached.ok ? 86_400_000 : 600_000);
    if (isNativeApp || fresh || !navigator.onLine) return;
    let alive = true;
    fetch(LATEST_RELEASE_API, { headers: { Accept: 'application/vnd.github+json' } })
      .then(async (res) => {
        // 404 means "no release yet"; any other failure (rate limit, outage) tells us nothing.
        if (!res.ok && res.status !== 404) return;
        const found = res.ok && ((await res.json()).assets ?? []).some((a: { name?: string }) => a.name === 'ChemCSEC.apk');
        try {
          localStorage.setItem(APK_CHECK_KEY, JSON.stringify({ t: Date.now(), ok: found }));
        } catch {
          // not remembered; checked again next time
        }
        if (alive) setOk(found);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return ok;
}

const UPDATE_CHECK_KEY = 'chemcsec:update-check';

/**
 * In the APK only: ask GitHub, at most once a day, whether a newer build has been released.
 * Releases are tagged v<build number>. Returns the newer build number, or null.
 */
export async function newerApkBuild(now = Date.now()): Promise<number | null> {
  // Google Play apps may only update through Play, so the Play build never looks for an APK.
  if (!isNativeApp || __PLAY__ || !navigator.onLine) return null;
  try {
    const cached = JSON.parse(localStorage.getItem(UPDATE_CHECK_KEY) ?? 'null') as { t: number; build: number } | null;
    let latest = cached && now - cached.t < 86_400_000 ? cached.build : null;
    if (latest === null) {
      const res = await fetch(LATEST_RELEASE_API, { headers: { Accept: 'application/vnd.github+json' } });
      if (!res.ok) return null;
      latest = parseInt(String((await res.json()).tag_name).replace(/^v/, ''), 10);
      if (!Number.isFinite(latest)) return null;
      localStorage.setItem(UPDATE_CHECK_KEY, JSON.stringify({ t: now, build: latest }));
    }
    return latest > __BUILD__ ? latest : null;
  } catch {
    return null; // offline or rate-limited: try again another day
  }
}
