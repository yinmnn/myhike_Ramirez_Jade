import { onAuthReady } from "./authentication.js";
import { db } from "./firebaseConfig.js";
import {
  doc,
  onSnapshot,
  getDoc,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

// Show personalized greeting AND load hikes with bookmark status
function showDashboard() {
  const nameElement = document.getElementById("name-goes-here");

  onAuthReady(async (user) => {
    if (!user) {
      location.href = "index.html";
      return;
    }

    // Reference the user document
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.exists() ? userDoc.data() : {};

    // Greeting
    const name = userData.name || user.displayName || user.email;
    if (nameElement) {
      nameElement.textContent = `${name}!`;
    }

    // Bookmarks array
    const bookmarks = userData.bookmarks || [];

    // Render hikes with bookmark state
    await displayCardsDynamically(user.uid, bookmarks);
  });
}

// Function to read and display the quote for a given day
function readQuote(day) {
  const quoteDocRef = doc(db, "quotes", day);

  onSnapshot(
    quoteDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        document.getElementById("quote-goes-here").textContent =
          docSnap.data().quote;
      } else {
        console.log("No such document!");
        document.getElementById("quote-goes-here").textContent =
          "No quote today.";
      }
    },
    (error) => {
      console.error("Error fetching quote:", error);
    }
  );
}

// Helper function to add the sample hike documents
function addHikeData() {
  const hikesRef = collection(db, "hikes");
  console.log("Adding sample hike data...");

  addDoc(hikesRef, {
    code: "BBY01",
    name: "Burnaby Lake Park Trail",
    city: "Burnaby",
    level: "easy",
    details: "A lovely place for a lunch walk.",
    length: 10,
    hike_time: 60,
    lat: 49.2467,
    lng: -122.9187,
    last_updated: serverTimestamp(),
  });

  addDoc(hikesRef, {
    code: "AM01",
    name: "Buntzen Lake Trail",
    city: "Anmore",
    level: "moderate",
    details: "Close to town and relaxing.",
    length: 10.5,
    hike_time: 80,
    lat: 49.3399,
    lng: -122.859,
    last_updated: serverTimestamp(),
  });

  addDoc(hikesRef, {
    code: "NV01",
    name: "Mount Seymour Trail",
    city: "North Vancouver",
    level: "hard",
    details: "Amazing ski slope views.",
    length: 8.2,
    hike_time: 120,
    lat: 49.3885,
    lng: -122.9409,
    last_updated: serverTimestamp(),
  });
}

// Seeds hikes collection ONLY IF empty
async function seedHikes() {
  const hikesRef = collection(db, "hikes");
  const querySnapshot = await getDocs(hikesRef);

  if (querySnapshot.empty) {
    console.log("Hikes collection is empty. Seeding data...");
    addHikeData();
  } else {
    console.log("Hikes collection already contains data. Skipping seed.");
  }
}

// Display hikes dynamically, with clickable bookmark icons
async function displayCardsDynamically(userId, bookmarks) {
  const cardTemplate = document.getElementById("hikeCardTemplate");
  const hikesCollectionRef = collection(db, "hikes");
  const container = document.getElementById("hikes-go-here");

  const imageMap = {
    BBY01: "PNG1.jpg",
    AM01: "PNG2.jpg",
    NV01: "PNG3.jpg",
  };

  container.innerHTML = "";

  try {
    const querySnapshot = await getDocs(hikesCollectionRef);

    querySnapshot.forEach((docSnap) => {
      const newcard = cardTemplate.content.cloneNode(true);
      const hike = docSnap.data();
      const hikeId = docSnap.id;

      newcard.querySelector(".card-title").textContent = hike.name;
      newcard.querySelector(".card-text").textContent =
        hike.details || `Located in ${hike.city}.`;
      newcard.querySelector(".card-length").textContent = hike.length;

      const fileName = imageMap[hike.code] || "placeholder.png";
      const img = newcard.querySelector(".card-image");
      img.src = `/images/${fileName}`;
      img.alt = `${hike.name} image`;

      newcard.querySelector(".read-more").href =
        `eachHike.html?docID=${hikeId}`;

      // Bookmark icon
      const icon = newcard.querySelector("i.material-icons");
      if (icon) {
        icon.id = "save-" + hikeId;

        const isBookmarked = bookmarks.includes(hikeId);
        icon.innerText = isBookmarked ? "bookmark" : "bookmark_border";

        icon.onclick = () => toggleBookmark(userId, hikeId);
      }

      container.appendChild(newcard);
    });
  } catch (error) {
    console.error("Error getting hikes: ", error);
  }
}

// Toggle bookmark state in Firestore and update UI
async function toggleBookmark(userId, hikeDocID) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.exists() ? userSnap.data() : {};
  const bookmarks = userData.bookmarks || [];

  const iconId = "save-" + hikeDocID;
  const icon = document.getElementById(iconId);

  const isBookmarked = bookmarks.includes(hikeDocID);

  try {
    if (isBookmarked) {
      // Remove from array
      await updateDoc(userRef, {
        bookmarks: arrayRemove(hikeDocID),
      });
      if (icon) icon.innerText = "bookmark_border";
    } else {
      // Add to array
      await updateDoc(userRef, {
        bookmarks: arrayUnion(hikeDocID),
      });
      if (icon) icon.innerText = "bookmark";
    }
  } catch (err) {
    console.error("Error toggling bookmark:", err);
  }
}

// Call functions when page loads
showDashboard();
readQuote("tuesday");
seedHikes();
