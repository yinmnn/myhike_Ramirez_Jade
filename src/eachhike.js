// eachhike.js
import { db } from "./firebaseConfig.js";
import { doc, getDoc } from "firebase/firestore";

// Map hike codes to image filenames
const imageMap = {
  BBY01: "PNG1.jpg",
  AM01: "PNG2.jpg",
  NV01: "PNG3.jpg",
};

// Function to get the docID from the URL
function getDocIdFromUrl() {
  const params = new URL(window.location.href).searchParams;
  return params.get("docID");
}

async function displayHikeInfo() {
  const id = getDocIdFromUrl();

  if (!id) {
    document.getElementById("hikeName").textContent = "No hike selected.";
    return;
  }

  try {
    const hikeRef = doc(db, "hikes", id);
    const hikeSnap = await getDoc(hikeRef);

    if (hikeSnap.exists()) {
      const hike = hikeSnap.data();

      // Update the hike name
      document.getElementById("hikeName").textContent = hike.name;

      // Get the image element and set the correct image source and alt text
      const img = document.getElementById("hikeImage");
      const imageFile = imageMap[hike.code] || "placeholder.png";
      img.src = `/images/${imageFile}`;
      img.alt = `Image of ${hike.name}`;

    } else {
      document.getElementById("hikeName").textContent = "Hike not found.";
    }
  } catch (error) {
    console.error("Error loading hike details:", error);
    document.getElementById("hikeName").textContent = "Error loading hike.";
  }
}

// Run the display function when the script loads
displayHikeInfo();
