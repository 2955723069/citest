import { signIn, validateCredentials } from "./auth.js";

export function initLogin({
  documentRef = document,
  storage = sessionStorage,
  location = window.location,
} = {}) {
  const form = documentRef.querySelector("#login-form");
  const username = documentRef.querySelector("#username");
  const password = documentRef.querySelector("#password");
  const showPassword = documentRef.querySelector("#show-password");
  const usernameError = documentRef.querySelector("#username-error");
  const passwordError = documentRef.querySelector("#password-error");
  const loginButton = documentRef.querySelector("#login-button");

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

    signIn(storage, username.value);
    location.assign("welcome.html");
  });

  username.setAttribute("name", "username");
  password.setAttribute("name", "password");
  loginButton.disabled = false;
}

if (typeof document !== "undefined") {
  initLogin();
}
