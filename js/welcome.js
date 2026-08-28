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
