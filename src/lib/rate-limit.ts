const MAX_ATTEMPTS = 10;
const WINDOW_MS = 60_000;

type Entry = { count: number; resetAt: number };
const store = new Map<string, Entry>();

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  entry.count += 1;
  return entry.count <= MAX_ATTEMPTS;
}
