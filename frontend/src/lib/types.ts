export interface SessionSummary {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export type ChatMode = "normal" | "reasoning";

export interface Message {
  id: string;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  reasoning_content: string | null;
  token_count: number | null;
  created_at: string;
}

export interface SessionDetail extends SessionSummary {
  messages: Message[];
}

export interface SessionListResponse {
  items: SessionSummary[];
  total: number;
  page: number;
  page_size: number;
}

export interface SessionCreatePayload {
  title?: string;
}

export interface SessionUpdatePayload {
  title: string;
}
