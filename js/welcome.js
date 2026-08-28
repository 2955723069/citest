import { currentUsername, signOut } from "./auth.js";

export function initWelcome({
  documentRef = document,
  storage = sessionStorage,
  location = window.location,
} = {}) {
  const username = currentUsername(storage);

  if (!username) {
    location.replace("index.html");
    return false;
  }

  documentRef.querySelector("#current-user").textContent = username;
  documentRef.querySelector("#logout-button").addEventListener("click", () => {
    signOut(storage);
    location.replace("index.html");
  });
  return true;
}

if (typeof document !== "undefined") {
  initWelcome();
}
