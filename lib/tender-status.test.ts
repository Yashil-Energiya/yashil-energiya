import assert from "node:assert/strict";
import { test } from "node:test";
import { effectiveStatus, tashkentToday } from "./tender-status.ts";

test("effectiveStatus: open tender closes only after the deadline day", () => {
  assert.equal(effectiveStatus("open", "2026-11-03", "2026-11-03"), "open");
  assert.equal(effectiveStatus("open", "2026-11-03", "2026-11-04"), "closed");
  assert.equal(effectiveStatus("completed", "2025-01-01", "2026-11-04"), "completed");
});

test("tashkentToday: uses Tashkent time (UTC+5)", () => {
  // 20:00 UTC on Nov 3 is already Nov 4 in Tashkent.
  assert.equal(tashkentToday(new Date("2026-11-03T20:00:00Z")), "2026-11-04");
});
