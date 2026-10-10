type HeaderSource = { get(name: string): string | null };

/**
 * Resolves the public base URL of the app from the incoming request headers, so
 * generated links always point at the host/port the user is actually browsing
 * (e.g. http://localhost:3001 in dev) instead of a hardcoded env value.
 */
export function getRequestBaseUrl(headers?: HeaderSource | null): string | undefined {
  if (!headers) return undefined;

  const origin = headers.get("origin");
  if (origin) return origin.replace(/\/+$/, "");

  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  if (!host) return undefined;

  const protocol = (headers.get("x-forwarded-proto") ?? "http").split(",")[0].trim();
  return `${protocol}://${host}`;
}

/**
 * Reads the headers of the current request when called inside a Next.js request
 * scope (server action / route handler). Returns `undefined` outside of one, so
 * callers can safely fall back to another source.
 */
export async function getNextRequestHeaders(): Promise<HeaderSource | undefined> {
  try {
    const { headers } = await import("next/headers");
    return await headers();
  } catch {
    return undefined;
  }
}

/**
 * Walks the given header sources in order (first one that yields a host wins)
 * and falls back to `BETTER_AUTH_URL` when none of them is usable - e.g. when
 * an email is triggered outside of a request.
 */
export function getAppBaseUrl(
  ...sources: (HeaderSource | null | undefined)[]
): string {
  for (const source of sources) {
    const url = getRequestBaseUrl(source);
    if (url) return url;
  }

  return process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
}
