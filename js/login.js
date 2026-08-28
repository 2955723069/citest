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
