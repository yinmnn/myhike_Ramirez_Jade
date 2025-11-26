import { onAuthReady } from "./authentication.js";
import { db } from "./firebaseConfig.js";
import { doc, getDoc } from "firebase/firestore";

function initSavedPage() {
  onAuthReady(async (user) => {
    if (!user) {
      location.href = "/login.html";
      return;
    }

    const userId = user.uid;
    await insertNameFromFirestore(userId);
    await renderSavedHikes(userId);
  });
}

initSavedPage();

// Show the user's name on this page
async function insertNameFromFirestore(userId) {
  try {
    const userRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userRef);

    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      const userName = data.name || "Hiker";
      document.getElementById("name-goes-here").innerText = userName;
    }
  } catch (e) {
    console.error("Error reading user document:", e);
  }
}

// Read bookmarks and display saved hikes
async function renderSavedHikes(userId) {
  try {
    const userRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userRef);
    const userData = userDocSnap.exists() ? userDocSnap.data() : {};
    const bookmarks = userData.bookmarks || [];

    const cardTemplate = document.getElementById("savedCardTemplate");
    const hikeCardGroup = document.getElementById("hikeCardGroup");

    hikeCardGroup.innerHTML = "";

    if (bookmarks.length === 0) {
      hikeCardGroup.innerHTML =
        '<p class="text-muted">You have no saved hikes yet.</p>';
      return;
    }

    const imageMap = {
      BBY01: "PNG1.jpg",
      AM01: "PNG2.jpg",
      NV01: "PNG3.jpg",
    };

    for (const hikeId of bookmarks) {
      const hikeRef = doc(db, "hikes", hikeId);
      const hikeDocSnap = await getDoc(hikeRef);

      if (!hikeDocSnap.exists()) {
        console.log("No hike document for ID", hikeId);
        continue;
      }

      const hikeData = hikeDocSnap.data();
      const newcard = cardTemplate.content.cloneNode(true);

      newcard.querySelector(".card-title").innerText = hikeData.name;
      newcard.querySelector(".card-text").textContent =
        hikeData.details || `Located in ${hikeData.city}.`;
      newcard.querySelector(".card-length").innerText = hikeData.length;

      const imageFile = imageMap[hikeData.code] || "placeholder.png";
      const img = newcard.querySelector(".card-image");
      img.src = `/images/${imageFile}`;
      img.alt = `Image of ${hikeData.name}`;

      newcard.querySelector(".read-more").href =
        "eachHike.html?docID=" + hikeId;

      hikeCardGroup.appendChild(newcard);
    }
  } catch (e) {
    console.error("Error rendering saved hikes:", e);
  }
}
