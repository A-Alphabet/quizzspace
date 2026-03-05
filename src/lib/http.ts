export type FetchJsonResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
};

export async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<FetchJsonResult<T>> {
  try {
    const response = await fetch(input, init);

    let parsed: unknown = null;
    try {
      parsed = await response.json();
    } catch {
      parsed = null;
    }

    if (!response.ok) {
      const message =
        parsed && typeof parsed === 'object' && 'error' in parsed && typeof (parsed as { error?: unknown }).error === 'string'
          ? ((parsed as { error: string }).error)
          : `Request failed (${response.status})`;

      return {
        ok: false,
        status: response.status,
        data: null,
        error: message,
      };
    }

    return {
      ok: true,
      status: response.status,
      data: (parsed as T) ?? null,
      error: null,
    };
  } catch {
    return {
      ok: false,
      status: 0,
      data: null,
      error: 'Network error. Please check your connection and try again.',
    };
  }
}
