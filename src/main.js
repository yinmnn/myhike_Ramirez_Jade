import { onAuthReady } from "./authentication.js";

function showDashboard() {
  const nameElement = document.getElementById("name-goes-here");

  onAuthReady((user) => {
    if (!user) {
      // If no user is signed in, redirect to login page
      location.href = "index.html";
      return;
    }

    // Use displayName if available, otherwise use email
    const name = user.displayName || user.email;

    if (nameElement) {
      nameElement.textContent = `${name}!`;
    }
  });
}

showDashboard();