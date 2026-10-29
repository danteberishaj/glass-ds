import { useSyncExternalStore } from 'react';
import { dayKey, getWeekStartsOn, makeDay, type WeekDay } from '../components/Calendar/date-utils';
import { isDev } from './env';

/*
 * Client-only facts that differ between server and browser (clock, time zone, language), read
 * through `useSyncExternalStore` with a `null` server snapshot. Server markup and the hydration
 * render agree (no "today", no locale), and the client snapshot fills in right after.
 * Not exported from the package.
 */

export type ClientEnvironment = {
  /** Today as a noon-pinned calendar day (see date-utils). */
  today: Date;
  /** First day of the week for `locale`. */
  weekStartsOn: WeekDay;
  /** `<html lang>` when set, else `navigator.language`. */
  locale: string;
};


let cached: ClientEnvironment | null = null;

function getSnapshot(): ClientEnvironment | null {
  const locale = document.documentElement.lang || navigator.language;
  const todayKey = dayKey(new Date());
  // Return the same object while nothing changed: useSyncExternalStore compares snapshots by identity.
  if (cached && cached.locale === locale && dayKey(cached.today) === todayKey) return cached;
  cached = {
    today: makeDay(Math.floor(todayKey / 10000), (Math.floor(todayKey / 100) % 100) - 1, todayKey % 100),
    weekStartsOn: getWeekStartsOn(locale),
    locale,
  };
  return cached;
}

const getServerSnapshot = () => null;

// Re-checked every minute so a page left open past midnight moves the "today" marker; the language
// event covers a changed browser preference. `<html lang>` changes are picked up on the next tick.
function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 60_000);
  window.addEventListener('languagechange', onChange);
  return () => {
    clearInterval(id);
    window.removeEventListener('languagechange', onChange);
  };
}

/** `null` on the server and during hydration; the client environment afterwards. */
export function useClientEnvironment(): ClientEnvironment | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

let warnedServerLocale = false;

/**
 * Dev-only, once per process: a date component rendered on the server without `locale` formats
 * with the server's default locale, which can differ from the client's (text mismatch at hydration).
 */
export function warnServerRenderWithoutLocale(component: string, locale: string | undefined): void {
  if (!isDev || warnedServerLocale || locale !== undefined || typeof window !== 'undefined') return;
  warnedServerLocale = true;
  console.warn(
    `glass-ds: <${component}> was server-rendered without \`locale\`. Pass one (e.g. the request's language) so ` +
      'month and weekday names match on the client; otherwise they are re-rendered after hydration.',
  );
}
