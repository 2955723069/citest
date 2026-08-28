import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL("../" + path, import.meta.url), "utf8");

test("login page exposes an accessible form contract", async () => {
  const html = await read("index.html");
  assert.match(html, /id="login-form"/);
  assert.match(html, /<label[^>]*for="username"/);
  assert.match(html, /id="username"[^>]*autocomplete="username"/);
  assert.match(html, /<label[^>]*for="password"/);
  assert.match(html, /id="password"[^>]*autocomplete="current-password"/);
  assert.match(html, /id="show-password"[^>]*type="checkbox"/);
  assert.match(html, /src="js\/login\.js"/);
});

test("shared stylesheet includes responsive and reduced-motion rules", async () => {
  const css = await read("styles.css");
  assert.match(css, /@media \(max-width: 640px\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /:focus-visible/);
});
