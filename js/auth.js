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
