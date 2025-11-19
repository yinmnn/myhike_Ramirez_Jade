import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";  // note setDoc imported here
import { auth, db } from "./firebaseConfig.js";

// Populate user info into the form on page load
function populateUserInfo() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          document.getElementById("nameInput").value = userData.name || "";
          document.getElementById("schoolInput").value = userData.school || "";
          document.getElementById("cityInput").value = userData.city || "";
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    } else {
      window.location.href = "/login.html";
    }
  });
}

// Enable editing the form fields when Edit button is clicked
document.getElementById("editButton").addEventListener("click", () => {
  document.getElementById("personalInfoFields").disabled = false;
});

// Save updated user info to Firestore when Save button is clicked
document.getElementById("saveButton").addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) {
    alert("Please log in first.");
    return;
  }

  const name = document.getElementById("nameInput").value;
  const school = document.getElementById("schoolInput").value;
  const city = document.getElementById("cityInput").value;

  try {
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, { name, school, city }, { merge: true });  // <-- Changed here
    alert("Profile updated successfully!");
    document.getElementById("personalInfoFields").disabled = true;
  } catch (error) {
    console.error("Error updating profile:", error);
    alert("Failed to update profile.");
  }
});

// Call populate function on script load
populateUserInfo();
