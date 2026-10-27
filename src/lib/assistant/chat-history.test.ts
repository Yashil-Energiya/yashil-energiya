import assert from "node:assert/strict";
import { test } from "node:test";
import {
  MAX_ASSISTANT_MESSAGE_CHARS,
  MAX_MESSAGES,
  MAX_USER_MESSAGE_CHARS,
  chatHistory,
} from "./chat-history.ts";

test("chatHistory: a long earlier answer is trimmed, not rejected", () => {
  // A news digest with links easily passes 2000 characters; the next
  // question must still go through.
  const history = chatHistory([
    { role: "user", content: "News digest" },
    { role: "assistant", content: "a".repeat(9000) },
    { role: "user", content: "Tell me more" },
  ]);

  assert.ok(history);
  assert.equal(history.length, 3);
  assert.equal(history[1].content.length, MAX_ASSISTANT_MESSAGE_CHARS);
  assert.equal(history[2].content, "Tell me more");
});

test("chatHistory: rejects a too-long question and malformed turns", () => {
  assert.equal(
    chatHistory([
      { role: "user", content: "a".repeat(MAX_USER_MESSAGE_CHARS + 1) },
    ]),
    null,
  );
  assert.equal(chatHistory([{ role: "system", content: "hi" }]), null);
  assert.equal(chatHistory([{ role: "user", content: "   " }]), null);
  assert.equal(chatHistory([{ role: "user", content: 1 }]), null);
  assert.equal(chatHistory([null]), null);
});

test("chatHistory: keeps only the last turns", () => {
  const raw = Array.from({ length: MAX_MESSAGES + 5 }, (_, index) => ({
    role: "user",
    content: `q${index}`,
  }));

  const history = chatHistory(raw);

  assert.ok(history);
  assert.equal(history.length, MAX_MESSAGES);
  assert.equal(history[0].content, "q5");
});
