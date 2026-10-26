import assert from "node:assert/strict";
import { test } from "node:test";
import { escapeHtml } from "./html.ts";
import { leadFieldsError } from "./lead-limits.ts";

const feedback = ["firstName", "phone", "email", "message"] as const;
const valid = {
  firstName: "Ali",
  phone: "+998 90 000 00 00",
  email: "ali@example.com",
  message: "Hello",
};

test("leadFieldsError: valid request passes", () => {
  assert.equal(leadFieldsError(valid, [...feedback]), null);
  assert.equal(
    leadFieldsError({ firstName: "Ali", phone: "1" }, ["firstName", "phone"]),
    null,
  );
});

test("leadFieldsError: rejects missing, wrong-type, long and bad-email input", () => {
  assert.equal(
    leadFieldsError({ ...valid, message: "" }, [...feedback]),
    "Missing required fields",
  );
  assert.equal(
    leadFieldsError({ ...valid, firstName: 1 }, [...feedback]),
    "Invalid input",
  );
  assert.equal(
    leadFieldsError({ ...valid, phone: ["1"] }, [...feedback]),
    "Invalid input",
  );
  assert.equal(
    leadFieldsError({ ...valid, firstName: "a".repeat(101) }, [...feedback]),
    "Input is too long",
  );
  assert.equal(
    leadFieldsError({ ...valid, email: "not-an-email" }, [...feedback]),
    "Invalid email",
  );
  // Optional email on the calculator form is still checked when given.
  assert.equal(
    leadFieldsError({ firstName: "Ali", phone: "1", email: "x@" }, [
      "firstName",
      "phone",
    ]),
    "Invalid email",
  );
});

test("escapeHtml: lead fields cannot inject markup into the email", () => {
  assert.equal(
    escapeHtml(`<b onclick="x">'&'</b>`),
    "&lt;b onclick=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/b&gt;",
  );
});
