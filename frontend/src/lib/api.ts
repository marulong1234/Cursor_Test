import type {
  SessionCreatePayload,
  SessionDetail,
  SessionListResponse,
  SessionSummary,
  SessionUpdatePayload,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (body.detail) {
        message = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
      }
    } catch {
      // ignore parse errors
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  listSessions(page = 1, pageSize = 50) {
    return request<SessionListResponse>(`/api/sessions?page=${page}&page_size=${pageSize}`);
  },

  createSession(data: SessionCreatePayload = {}) {
    return request<SessionSummary>("/api/sessions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getSession(sessionId: string) {
    return request<SessionDetail>(`/api/sessions/${sessionId}`);
  },

  updateSession(sessionId: string, data: SessionUpdatePayload) {
    return request<SessionSummary>(`/api/sessions/${sessionId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteSession(sessionId: string) {
    return request<void>(`/api/sessions/${sessionId}`, {
      method: "DELETE",
    });
  },
};
