# Demo Login Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Build a responsive two-page demo login website that accepts any non-empty credentials and provides authenticated access to Baidu, Bing, and GitHub links.

**Architecture:** Use native HTML, CSS, and JavaScript ES modules with no runtime dependencies. Keep authentication state operations in a pure module backed by sessionStorage, page-specific DOM behavior in small controllers, and verify behavior with the Node.js built-in test runner plus static HTML contract tests.

**Tech Stack:** HTML5, CSS3, JavaScript ES modules, Node.js 22 built-in test runner, static HTTP server

**Spec:** docs/superpowers/specs/2026-08-28-demo-login-website-design.md

## Global Constraints

- The site must run without a backend, build step, or third-party runtime library.
- Any non-empty username and password are accepted.
- Only the username is stored in sessionStorage; the password is never stored.
- The welcome page is unavailable without an active demo session.
- External links open in a new tab with rel="noopener noreferrer".
- The interface must support keyboard navigation, mobile and desktop layouts, visible focus, and prefers-reduced-motion.
- Visual style is modern and light, with neutral surfaces, blue primary actions, and a small green signed-in state.

---

## File Structure

- package.json: declares ES module mode and the npm test command.
- index.html: semantic login page markup and metadata.
- welcome.html: authenticated welcome page and external destinations.
- styles.css: shared design tokens, page layouts, interaction states, and responsive rules.
- js/auth.js: validation and sessionStorage operations with no DOM dependency.
- js/login.js: login form behavior, validation messages, and password visibility.
- js/welcome.js: access guard, username rendering, and logout behavior.
- assets/login-workspace.webp: local light workspace image used as a restrained page visual.
- tests/auth.test.js: behavior tests for validation and session lifecycle.
- tests/site-contract.test.js: static contracts for page semantics, script wiring, links, and safety attributes.

### Task 1: Authentication State Module

**Files:**
- Create: package.json
- Create: tests/auth.test.js
- Create: js/auth.js

**Interfaces:**
- Produces: SESSION_KEY string; validateCredentials(username, password) returning { username: string, password: string }; signIn(storage, username) returning void; currentUsername(storage) returning string or null; signOut(storage) returning void.
- Consumes: a Storage-compatible object implementing getItem, setItem, and removeItem.

- [ ] **Step 1: Add the test runner configuration**

Create package.json:

~~~json
{
  "name": "citest-demo-login",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test"
  }
}
~~~

- [ ] **Step 2: Write failing authentication tests**

Create tests/auth.test.js with a Map-backed storage fake and tests for trimming the username, rejecting blank fields, saving only the username, reading the session, and clearing it:

~~~js
import test from "node:test";
import assert from "node:assert/strict";
import {
  SESSION_KEY,
  currentUsername,
  signIn,
  signOut,
  validateCredentials,
} from "../js/auth.js";

function createStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    snapshot: () => Object.fromEntries(values),
  };
}

test("validateCredentials accepts non-empty credentials", () => {
  assert.deepEqual(validateCredentials("  Alice  ", " secret "), {
    username: "",
    password: "",
  });
});

test("validateCredentials reports blank username and password separately", () => {
  assert.deepEqual(validateCredentials("   ", ""), {
    username: "请输入账号",
    password: "请输入密码",
  });
});

test("session lifecycle stores only username and removes it on sign out", () => {
  const storage = createStorage();
  signIn(storage, "Alice");
  assert.equal(currentUsername(storage), "Alice");
  assert.deepEqual(storage.snapshot(), { [SESSION_KEY]: "Alice" });
  signOut(storage);
  assert.equal(currentUsername(storage), null);
});
~~~

- [ ] **Step 3: Run tests and verify the expected failure**

Run: npm test

Expected: FAIL with ERR_MODULE_NOT_FOUND for js/auth.js.

- [ ] **Step 4: Implement the minimal authentication module**

Create js/auth.js:

~~~js
export const SESSION_KEY = "citest.demo.username";

export function validateCredentials(username, password) {
  return {
    username: username.trim() ? "" : "请输入账号",
    password: password ? "" : "请输入密码",
  };
}

export function signIn(storage, username) {
  storage.setItem(SESSION_KEY, username.trim());
}

export function currentUsername(storage) {
  const username = storage.getItem(SESSION_KEY);
  return username?.trim() || null;
}

export function signOut(storage) {
  storage.removeItem(SESSION_KEY);
}
~~~

- [ ] **Step 5: Run authentication tests**

Run: npm test

Expected: 3 tests PASS.

- [ ] **Step 6: Commit the authentication module**

~~~bash
git add package.json tests/auth.test.js js/auth.js
git commit -m "feat: add demo authentication state"
~~~

### Task 2: Login Page and Shared Visual System

**Files:**
- Create: tests/site-contract.test.js
- Create: index.html
- Create: styles.css
- Create: js/login.js
- Create: assets/login-workspace.webp

**Interfaces:**
- Consumes: validateCredentials and signIn from js/auth.js.
- Produces: form element #login-form; inputs #username and #password; errors #username-error and #password-error; checkbox #show-password; redirect to welcome.html after valid submit.

- [ ] **Step 1: Write failing login-page contract tests**

Create tests/site-contract.test.js:

~~~js
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
~~~

- [ ] **Step 2: Run the contract tests and verify failure**

Run: npm test

Expected: authentication tests pass; site contract tests fail with ENOENT for index.html or styles.css.

- [ ] **Step 3: Generate the local page visual**

Invoke the imagegen skill to create a landscape image at least 1536 by 1024 pixels, then save the final optimized asset as assets/login-workspace.webp. Use this exact art direction: bright modern workspace by a window, white and pale gray surfaces, restrained blue accents, natural daylight, realistic editorial photography, uncluttered, no people, no text, no logos, enough quiet negative space for a compact login panel overlay.

Verify the file is a valid WebP and larger than 100 KB:

~~~bash
file assets/login-workspace.webp
wc -c assets/login-workspace.webp
~~~

- [ ] **Step 4: Implement semantic login markup**

Create index.html with lang="zh-CN", responsive viewport metadata, shared stylesheet, a main landmark, the five required IDs from the contract, aria-describedby links from inputs to error elements, an aria-live status region, and type="module" for js/login.js. The visible copy is:

~~~html
<p class="eyebrow">CITEST PORTAL</p>
<h1>欢迎回来</h1>
<p class="intro">登录以继续访问你的快捷入口。</p>
~~~

The submit button text is "登录", the checkbox label is "显示密码", and the demo notice is "演示模式：输入任意非空账号和密码即可登录。"

- [ ] **Step 5: Implement login behavior**

Create js/login.js:

~~~js
import { signIn, validateCredentials } from "./auth.js";

const form = document.querySelector("#login-form");
const username = document.querySelector("#username");
const password = document.querySelector("#password");
const showPassword = document.querySelector("#show-password");
const usernameError = document.querySelector("#username-error");
const passwordError = document.querySelector("#password-error");

showPassword.addEventListener("change", () => {
  password.type = showPassword.checked ? "text" : "password";
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const errors = validateCredentials(username.value, password.value);
  usernameError.textContent = errors.username;
  passwordError.textContent = errors.password;
  username.setAttribute("aria-invalid", String(Boolean(errors.username)));
  password.setAttribute("aria-invalid", String(Boolean(errors.password)));

  if (errors.username || errors.password) {
    (errors.username ? username : password).focus();
    return;
  }

  signIn(sessionStorage, username.value);
  window.location.assign("welcome.html");
});
~~~

- [ ] **Step 6: Implement the complete shared stylesheet**

Create styles.css with these exact design tokens and behaviors:

~~~css
:root {
  color-scheme: light;
  --page: #f5f7fb;
  --surface: #ffffff;
  --text: #172033;
  --muted: #667085;
  --line: #d9e0ea;
  --primary: #1769e0;
  --primary-hover: #0f56bd;
  --success: #18794e;
  --danger: #c52a2a;
  --focus: #8bbcff;
  --radius: 8px;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
~~~

Use a full-viewport background image with a light solid fallback and readable overlay, a centered login shell constrained to 440px, 8px panel radius, 44px minimum controls, 2px focus-visible outline, fixed-height error rows to prevent layout shift, and no negative letter-spacing. At max-width 640px, use 16px page padding and full-width actions. Under prefers-reduced-motion: reduce, set animation-duration and transition-duration to 0.01ms.

- [ ] **Step 7: Run login-page tests**

Run: npm test

Expected: all authentication and login contract tests PASS.

- [ ] **Step 8: Commit the login experience**

~~~bash
git add assets/login-workspace.webp index.html styles.css js/login.js tests/site-contract.test.js
git commit -m "feat: build responsive demo login page"
~~~

### Task 3: Protected Welcome Page and Final Verification

**Files:**
- Modify: tests/site-contract.test.js
- Create: welcome.html
- Create: js/welcome.js
- Modify: styles.css
- Create: README.md

**Interfaces:**
- Consumes: currentUsername and signOut from js/auth.js; #current-user and #logout-button from welcome.html.
- Produces: immediate redirect to index.html for missing session; escaped username display through textContent; logout redirect; destination links to Baidu, Bing, and GitHub.

- [ ] **Step 1: Add failing welcome-page contract tests**

Append to tests/site-contract.test.js:

~~~js
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
~~~

- [ ] **Step 2: Run tests and verify welcome contracts fail**

Run: npm test

Expected: the new tests fail with ENOENT for welcome.html or js/welcome.js.

- [ ] **Step 3: Implement the welcome page**

Create welcome.html with lang="zh-CN", responsive metadata, styles.css, a compact top bar, a signed-in status containing #current-user, and #logout-button. The main heading is "你的快捷入口". Add exactly three destination anchors with the URLs in the tests, target="_blank", and rel="noopener noreferrer". Each destination shows its service name and a short domain label; the link itself remains the only interactive control in each repeated item.

- [ ] **Step 4: Implement access control and logout**

Create js/welcome.js:

~~~js
import { currentUsername, signOut } from "./auth.js";

const username = currentUsername(sessionStorage);

if (!username) {
  window.location.replace("index.html");
} else {
  document.querySelector("#current-user").textContent = username;
  document.querySelector("#logout-button").addEventListener("click", () => {
    signOut(sessionStorage);
    window.location.replace("index.html");
  });
}
~~~

- [ ] **Step 5: Finish welcome-page styles**

Extend styles.css with an unframed welcome layout, a restrained top bar, responsive three-column destination grid collapsing to one column below 640px, 8px destination item radius, green signed-in indicator, and a compact logout control using the familiar ↪ symbol with aria-label="退出登录" and title="退出登录". Ensure titles, URLs, and username wrap without overflow.

- [ ] **Step 6: Add run instructions**

Create README.md:

~~~~markdown
# CITEST Demo Login

A static two-page demo login website. Any non-empty username and password can sign in; credentials are not sent to a server.

## Run

~~~bash
python3 -m http.server 4173
~~~

Open http://127.0.0.1:4173. Run the automated checks with npm test.
~~~~

- [ ] **Step 7: Run all automated checks**

Run: npm test

Expected: all tests PASS with zero failures.

- [ ] **Step 8: Run a static server smoke test**

Run the server:

~~~bash
python3 -m http.server 4173
~~~

In another shell verify both documents and the generated image:

~~~bash
curl -I http://127.0.0.1:4173/
curl -I http://127.0.0.1:4173/welcome.html
curl -I http://127.0.0.1:4173/assets/login-workspace.webp
~~~

Expected: HTTP 200 for all three requests and content types text/html, text/html, and image/webp respectively.

- [ ] **Step 9: Perform viewport and keyboard checks**

At 1440 by 900 and 390 by 844, confirm there is no horizontal scrolling, overlap, clipped text, or blank background asset. Tab through every interactive control, submit blank values, toggle password visibility, sign in, open each destination, log out, and directly revisit welcome.html to confirm redirection. Record any browser tooling limitation rather than claiming an unperformed visual check.

- [ ] **Step 10: Commit the completed website**

~~~bash
git add welcome.html js/welcome.js styles.css tests/site-contract.test.js README.md
git commit -m "feat: add protected destination page"
~~~

- [ ] **Step 11: Final repository verification**

Run:

~~~bash
git status --short
git log --oneline --decorate -4
~~~

Expected: empty status output and commits for the design, authentication module, login page, and welcome page.
