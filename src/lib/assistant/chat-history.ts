// Validation of the chat history the client sends with every question. Kept
// apart from the route, which loads Redis and Gemini on import, so it can be
// tested on its own.

/** Keep the last N turns to bound token cost and latency. */
export const MAX_MESSAGES = 20;
/** Same as the chat input's maxLength. */
export const MAX_USER_MESSAGE_CHARS = 2000;
/** Earlier answers can be longer than a question: trim them, never reject. */
export const MAX_ASSISTANT_MESSAGE_CHARS = 6000;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** The last MAX_MESSAGES turns, or null when any of them is malformed. */
export function chatHistory(raw: unknown[]): ChatMessage[] | null {
  const messages: ChatMessage[] = [];

  for (const item of raw.slice(-MAX_MESSAGES)) {
    const message = item as Partial<ChatMessage> | null;
    if (
      !message ||
      (message.role !== "user" && message.role !== "assistant") ||
      typeof message.content !== "string" ||
      message.content.trim().length === 0
    ) {
      return null;
    }

    if (message.role === "user") {
      if (message.content.length > MAX_USER_MESSAGE_CHARS) return null;
      messages.push({ role: "user", content: message.content });
    } else {
      messages.push({
        role: "assistant",
        content: message.content.slice(0, MAX_ASSISTANT_MESSAGE_CHARS),
      });
    }
  }

  return messages;
}
