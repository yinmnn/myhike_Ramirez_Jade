import { db, auth } from "./firebaseConfig.js";
import { collection, doc, getDoc, addDoc, serverTimestamp } from "firebase/firestore";

// Retrieve hike ID from Local Storage
const hikeDocID = localStorage.getItem("hikeDocID");

// Display hike name on page
async function displayHikeName(id) {
  try {
    const hikeRef = doc(db, "hikes", id);
    const hikeSnap = await getDoc(hikeRef);

    if (hikeSnap.exists()) {
      document.getElementById("hikeName").textContent = hikeSnap.data().name;
    } else {
      document.getElementById("hikeName").textContent = "Hike not found";
    }
  } catch (error) {
    console.error("Error fetching hike name:", error);
  }
}

// Manage star rating UI and value
let hikeRating = 0;

function manageStars() {
  const stars = document.querySelectorAll(".star");

  stars.forEach((star, index) => {
    star.addEventListener("click", () => {
      stars.forEach((s, i) => {
        s.textContent = i <= index ? "star" : "star_outline";
      });
      hikeRating = index + 1;
      console.log("Selected rating:", hikeRating);
    });
  });
}

// Write the review to Firestore
async function writeReview() {
  const title = document.getElementById("title").value.trim();
  const level = document.getElementById("level").value;
  const season = document.getElementById("season").value;
  const description = document.getElementById("description").value.trim();
  const flooded = document.querySelector('input[name="flooded"]:checked')?.value || "unsure";
  const scrambled = document.querySelector('input[name="scrambled"]:checked')?.value || "unsure";

  if (!title || !description) {
    alert("Please fill in all required fields (Title and Description).");
    return;
  }

  const user = auth.currentUser;

  if (!user) {
    alert("You must be logged in to submit a review.");
    return;
  }

  try {
    await addDoc(collection(db, "reviews"), {
      hikeDocID,
      userID: user.uid,
      title,
      level,
      season,
      description,
      flooded,
      scrambled,
      rating: hikeRating,
      timestamp: serverTimestamp(),
    });
    alert("Review submitted successfully!");
    // Redirect back to hike page
    window.location.href = `eachHike.html?docID=${hikeDocID}`;
  } catch (error) {
    console.error("Error submitting review:", error);
    alert("Failed to submit review. Please try again.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (!hikeDocID) {
    alert("No hike selected for review.");
    return;
  }

  displayHikeName(hikeDocID);
  manageStars();

  const submitBtn = document.getElementById("submitBtn");
  submitBtn.addEventListener("click", writeReview);
});
