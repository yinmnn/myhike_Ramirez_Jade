import { onAuthReady } from "./authentication.js";
import { db } from "./firebaseConfig.js";
import { doc, onSnapshot, getDoc, collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

// Show personalized greeting on the dashboard
function showDashboard() {
  const nameElement = document.getElementById("name-goes-here"); // The element to show greeting

  onAuthReady(async (user) => {
    if (!user) {
      location.href = "index.html";
      return;
    }

    const userDoc = await getDoc(doc(db, "users", user.uid));
    const name = userDoc.exists()
      ? userDoc.data().name
      : user.displayName || user.email;

    if (nameElement) {
      nameElement.textContent = `${name}!`;
    }
  });
}

// Function to read and display the quote for a given day
function readQuote(day) {
  const quoteDocRef = doc(db, "quotes", day);

  onSnapshot(
    quoteDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        document.getElementById("quote-goes-here").textContent = docSnap.data().quote;
      } else {
        console.log("No such document!");
        document.getElementById("quote-goes-here").textContent = "No quote today.";
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

// Function seeds hikes collection ONLY IF empty
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

// Function to display hikes dynamically on the page
async function displayCardsDynamically() {
  const cardTemplate = document.getElementById("hikeCardTemplate");
  const hikesCollectionRef = collection(db, "hikes");
  const container = document.getElementById("hikes-go-here");

  // Map hike codes to your PNG file names located in public/images/
  const imageMap = {
    BBY01: "PNG1.jpg",
    AM01: "PNG2.jpg",
    NV01: "PNG3.jpg",
  };

  try {
    const querySnapshot = await getDocs(hikesCollectionRef);

    querySnapshot.forEach((doc) => {
      const newcard = cardTemplate.content.cloneNode(true);
      const hike = doc.data();

      newcard.querySelector(".card-title").textContent = hike.name;
      newcard.querySelector(".card-text").textContent = hike.details || `Located in ${hike.city}.`;
      newcard.querySelector(".card-length").textContent = hike.length;

      const fileName = imageMap[hike.code] || "placeholder.png";
      newcard.querySelector(".card-image").src = `/images/${fileName}`;
      newcard.querySelector(".card-image").alt = `${hike.name} image`;

      newcard.querySelector(".read-more").href = `eachHike.html?docID=${doc.id}`;

      container.appendChild(newcard);
    });
  } catch (error) {
    console.error("Error getting hikes: ", error);
  }
}

// Call functions when page loads
showDashboard();
readQuote("tuesday"); // Replace with dynamic day if desired
seedHikes();
displayCardsDynamically();
