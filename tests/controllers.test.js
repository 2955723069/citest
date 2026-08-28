import test from "node:test";
import assert from "node:assert/strict";
import { initLogin } from "../js/login.js";
import { initWelcome } from "../js/welcome.js";

class FakeElement {
  constructor(properties = {}) {
    Object.assign(this, {
      attributes: new Map(),
      checked: false,
      disabled: false,
      listeners: new Map(),
      textContent: "",
      type: "",
      value: "",
      focused: false,
    }, properties);
  }

  addEventListener(type, listener) {
    this.listeners.set(type, listener);
  }

  dispatch(type, event = {}) {
    this.listeners.get(type)?.(event);
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  focus() {
    this.focused = true;
  }
}

function createDocument(elements) {
  return {
    querySelector(selector) {
      return elements[selector];
    },
  };
}

function createStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

test("login controller enables safe submission and toggles password visibility", () => {
  const elements = {
    "#login-form": new FakeElement(),
    "#username": new FakeElement(),
    "#password": new FakeElement({ type: "password" }),
    "#show-password": new FakeElement(),
    "#username-error": new FakeElement(),
    "#password-error": new FakeElement(),
    "#login-button": new FakeElement({ disabled: true }),
  };

  initLogin({
    documentRef: createDocument(elements),
    storage: createStorage(),
    location: { assign() {} },
  });

  assert.equal(elements["#username"].getAttribute("name"), "username");
  assert.equal(elements["#password"].getAttribute("name"), "password");
  assert.equal(elements["#login-button"].disabled, false);

  elements["#show-password"].checked = true;
  elements["#show-password"].dispatch("change");
  assert.equal(elements["#password"].type, "text");
});

test("login controller reports invalid fields and stores only valid username", () => {
  const elements = {
    "#login-form": new FakeElement(),
    "#username": new FakeElement(),
    "#password": new FakeElement({ type: "password" }),
    "#show-password": new FakeElement(),
    "#username-error": new FakeElement(),
    "#password-error": new FakeElement(),
    "#login-button": new FakeElement({ disabled: true }),
  };
  const storage = createStorage();
  const destinations = [];

  initLogin({
    documentRef: createDocument(elements),
    storage,
    location: { assign: (value) => destinations.push(value) },
  });

  let prevented = false;
  elements["#login-form"].dispatch("submit", {
    preventDefault: () => {
      prevented = true;
    },
  });
  assert.equal(prevented, true);
  assert.equal(elements["#username-error"].textContent, "请输入账号");
  assert.equal(elements["#password-error"].textContent, "请输入密码");
  assert.equal(elements["#username"].focused, true);

  elements["#username"].value = "  Alice  ";
  elements["#password"].value = "secret";
  elements["#login-form"].dispatch("submit", { preventDefault() {} });
  assert.equal(storage.getItem("citest.demo.username"), "Alice");
  assert.deepEqual(destinations, ["welcome.html"]);
});

test("welcome controller guards missing sessions, renders username, and logs out", () => {
  const redirects = [];
  const missingResult = initWelcome({
    documentRef: createDocument({}),
    storage: createStorage(),
    location: { replace: (value) => redirects.push(value) },
  });
  assert.equal(missingResult, false);
  assert.deepEqual(redirects, ["index.html"]);

  const elements = {
    "#current-user": new FakeElement(),
    "#logout-button": new FakeElement(),
  };
  const storage = createStorage({ "citest.demo.username": "Alice" });
  const authenticatedRedirects = [];
  const authenticatedResult = initWelcome({
    documentRef: createDocument(elements),
    storage,
    location: { replace: (value) => authenticatedRedirects.push(value) },
  });
  assert.equal(authenticatedResult, true);
  assert.equal(elements["#current-user"].textContent, "Alice");

  elements["#logout-button"].dispatch("click");
  assert.equal(storage.getItem("citest.demo.username"), null);
  assert.deepEqual(authenticatedRedirects, ["index.html"]);
});
