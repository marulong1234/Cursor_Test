export type ChatMode = "normal" | "reasoning";

export interface ChatStreamRequest {
  session_id: string;
  message: string;
  mode: ChatMode;
}

export interface ChatStreamCallbacks {
  onReasoningDelta?: (content: string) => void;
  onContentDelta?: (content: string) => void;
  onDone?: (messageId: string) => void;
  onError?: (message: string) => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function parseSseBlock(block: string): { event: string; data: string } | null {
  const lines = block.split("\n");
  let event = "message";
  let data = "";

  for (const line of lines) {
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      data += line.slice(5).trim();
    }
  }

  if (!data) return null;
  return { event, data };
}

export async function streamChat(
  payload: ChatStreamRequest,
  callbacks: ChatStreamCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  const url = `${API_BASE}/api/chat/stream`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal,
    });
  } catch (error) {
    callbacks.onError?.(
      error instanceof Error
        ? `无法连接后端（${error.message}），请确认后端已启动且 NEXT_PUBLIC_API_URL 端口正确`
        : "无法连接后端",
    );
    return;
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (body.detail) {
        message = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
      }
    } catch {
      // ignore
    }
    callbacks.onError?.(message);
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    callbacks.onError?.("No response body");
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";

    for (const block of blocks) {
      const parsed = parseSseBlock(block);
      if (!parsed) continue;

      try {
        const json = JSON.parse(parsed.data) as Record<string, string>;

        switch (parsed.event) {
          case "reasoning_delta":
            callbacks.onReasoningDelta?.(json.content ?? "");
            break;
          case "content_delta":
            callbacks.onContentDelta?.(json.content ?? "");
            break;
          case "done":
            callbacks.onDone?.(json.message_id ?? "");
            break;
          case "error":
            callbacks.onError?.(json.message ?? "Unknown error");
            break;
        }
      } catch {
        callbacks.onError?.("Failed to parse SSE data");
      }
    }
  }
}
