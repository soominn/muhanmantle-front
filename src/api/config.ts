export interface FrontConfig {
  gameApiBase: string;
}

function normalizeBase(url: string): string {
  const parsed = new URL(url.trim());
  return parsed.origin;
}

export async function fetchFrontConfig(): Promise<FrontConfig> {
  const response = await fetch("/config.json");
  const config = (await response.json()) as Record<string, string | undefined>;

  // Preferred: BACKEND_URL (e.g. http://localhost:8000)
  const backend = config.BACKEND_URL?.trim();
  if (backend) {
    return { gameApiBase: `${normalizeBase(backend)}/api/game` };
  }

  // Backward-compat: old API_URL pointed to /api/simword
  const apiUrl = config.API_URL?.trim();
  if (apiUrl) {
    return { gameApiBase: `${normalizeBase(apiUrl)}/api/game` };
  }

  // Same-origin (e.g. Vite dev server proxy to FastAPI) — session cookies work reliably
  return { gameApiBase: "/api/game" };
}
