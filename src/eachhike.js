import { db } from "./firebaseConfig.js";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

// Image map for hike codes
const imageMap = {
  BBY01: "PNG1.jpg",
  AM01: "PNG2.jpg",
  NV01: "PNG3.jpg",
};

// Get docID param from URL
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

      document.getElementById("hikeName").textContent = hike.name;

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

function setupWriteReviewButton() {
  document.addEventListener("DOMContentLoaded", () => {
    const writeReviewBtn = document.getElementById("writeReviewBtn");

    if (writeReviewBtn) {
      writeReviewBtn.addEventListener("click", () => {
        const hikeID = getDocIdFromUrl();

        if (!hikeID) {
          console.warn("No hike ID found in URL. Cannot proceed.");
          return;
        }

        localStorage.setItem("hikeDocID", hikeID);
        window.location.href = "review.html";
      });
    }
  });
}

async function populateReviews() {
  const reviewCardTemplate = document.getElementById("reviewCardTemplate");
  const reviewCardGroup = document.getElementById("reviewCardGroup");

  const hikeID = getDocIdFromUrl();
  if (!hikeID) {
    console.warn("No hike ID found in URL - cannot load reviews.");
    return;
  }

  try {
    const q = query(collection(db, "reviews"), where("hikeDocID", "==", hikeID));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();

      const reviewCard = reviewCardTemplate.content.cloneNode(true);

      reviewCard.querySelector(".title").textContent = data.title || "No title";
      reviewCard.querySelector(".description").textContent = data.description || "";
      reviewCard.querySelector(".level").textContent = `Level: ${data.level || "Unknown"}`;
      reviewCard.querySelector(".season").textContent = `Season: ${data.season || "Unknown"}`;
      reviewCard.querySelector(".scrambled").textContent = `Scrambled: ${data.scrambled || "Unknown"}`;
      reviewCard.querySelector(".flooded").textContent = `Flooded: ${data.flooded || "Unknown"}`;

      let time = "";
      if (data.timestamp?.toDate) {
        time = data.timestamp.toDate().toLocaleString();
      }
      reviewCard.querySelector(".time").textContent = time;

      // Stars for rating
      let starsHTML = "";
      const rating = data.rating || 0;
      for (let i = 0; i < rating; i++) {
        starsHTML += '<span class="material-icons">star</span>';
      }
      for (let i = rating; i < 5; i++) {
        starsHTML += '<span class="material-icons">star_outline</span>';
      }
      reviewCard.querySelector(".star-rating").innerHTML = starsHTML;

      reviewCardGroup.appendChild(reviewCard);
    });
  } catch (error) {
    console.error("Error loading reviews:", error);
  }
}

// Run all when script loads
displayHikeInfo();
setupWriteReviewButton();
populateReviews();
