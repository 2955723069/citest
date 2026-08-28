import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = async (path) => {
  try {
    return await readFile(new URL("../" + path, import.meta.url), "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      return "";
    }
    throw error;
  }
};

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

test("login page cannot submit named credentials before JavaScript initializes", async () => {
  const html = await read("index.html");
  assert.doesNotMatch(html, /id="username"[^>]*name="username"/);
  assert.doesNotMatch(html, /id="password"[^>]*name="password"/);
  assert.match(html, /id="login-button"[^>]*disabled/);
  assert.match(html, /<noscript>/);
});

test("shared stylesheet includes responsive and reduced-motion rules", async () => {
  const css = await read("styles.css");
  assert.match(css, /@media \(max-width: 640px\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /button:disabled/);
});

test("welcome page exposes safe external destinations and session controls", async () => {
  const html = await read("welcome.html");
  assert.match(html, /id="current-user"/);
  assert.match(html, /id="logout-button"/);
  assert.match(html, /href="https:\/\/www\.baidu\.com\/?"/);
  assert.match(html, /href="https:\/\/www\.bing\.com\/?"/);
  assert.match(html, /href="https:\/\/github\.com\/?"/);
  assert.equal((html.match(/target="_blank"/g) ?? []).length, 3);
  assert.equal((html.match(/rel="noopener noreferrer"/g) ?? []).length, 3);
  assert.match(html, /src="js\/welcome\.js"/);
});

test("password values are never persisted", async () => {
  const sources = await Promise.all([
    read("js/auth.js"),
    read("js/login.js"),
    read("js/welcome.js"),
  ]);
  assert.doesNotMatch(sources.join("\n"), /setItem\([^)]*password/i);
});
