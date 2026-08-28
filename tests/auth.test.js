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
  signIn(storage, "  Alice  ");
  assert.equal(currentUsername(storage), "Alice");
  assert.deepEqual(storage.snapshot(), { [SESSION_KEY]: "Alice" });
  signOut(storage);
  assert.equal(currentUsername(storage), null);
});
