// src/authentication.js
// -------------------------------------------------------------
// Part of the COMP1800 Projects 1 Course (BCIT).
// Starter code provided for students to use and adapt.
// Contains reusable Firebase Authentication functions
// (login, signup, logout, and auth state checks).
// -------------------------------------------------------------

// Import Firebase services from your config
import { auth, db } from "./firebaseConfig.js";

// Import Firebase Authentication functions
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

// Import Firestore functions
import { doc, setDoc } from "firebase/firestore";

// -------------------------------------------------------------
// loginUser(email, password)
// -------------------------------------------------------------
// Logs an existing user into Firebase Authentication.
//
// Parameters:
//   email (string)    - user's email
//   password (string) - user's password
//
// Returns: Promise resolving to the user credential object.
// -------------------------------------------------------------
export async function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

// -------------------------------------------------------------
// signupUser(name, email, password)
// -------------------------------------------------------------
// Creates a new user account with Firebase Authentication,
// then updates the user's profile with a display name,
// and creates Firestore user profile document.
//
// Parameters:
//   name (string)     - user's display name
//   email (string)    - user's email
//   password (string) - user's password
//
// Returns: the created user object.
// -------------------------------------------------------------
export async function signupUser(name, email, password) {
  // 1. Create user with Firebase Authentication
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // 2. Update the displayName in the auth user profile
  await updateProfile(user, { displayName: name });

  try {
    // 3. Create Firestore document for this user in 'users' collection using user.uid as doc ID
    await setDoc(doc(db, "users", user.uid), {
      name: name,
      email: email,
      country: "Canada", // default value, can be changed later
      school: "BCIT",    // default value
    });
    console.log("Firestore user document created successfully!");
  } catch (error) {
    console.error("Error creating user document in Firestore:", error);
  }

  // 4. Return the created user object
  return user;
}

// -------------------------------------------------------------
// logoutUser()
// -------------------------------------------------------------
// Signs out the currently logged-in user and redirects them
// back to the login page (index.html).
//
// Usage:
//   await logoutUser();
// -------------------------------------------------------------
export async function logoutUser() {
  await signOut(auth);
  window.location.href = "index.html";
}

// -------------------------------------------------------------
// checkAuthState()
// -------------------------------------------------------------
// Observes changes in the user's authentication state (login/logout)
// and updates the UI or redirects accordingly.
//
// If the user is on "main.html":
//   - If logged in → displays "Hello, [Name]!"
//   - If not logged in → redirects to "index.html"
//
// This function should be called once when the page loads.
//
// Usage:
//   checkAuthState();
// -------------------------------------------------------------
export function checkAuthState() {
  onAuthStateChanged(auth, (user) => {
    if (window.location.pathname.endsWith("main.html")) {
      if (user) {
        const displayName = user.displayName || user.email;
        document.getElementById("welcomeMessage").textContent = `Hello, ${displayName}!`;
      } else {
        window.location.href = "index.html";
      }
    }
  });
}

// -------------------------------------------------------------
// onAuthReady(callback)
// -------------------------------------------------------------
// Wrapper for Firebase's onAuthStateChanged()
// Runs the given callback(user) when Firebase resolves or changes auth state.
// Useful for showing user info or redirecting after login/logout.
export function onAuthReady(callback) {
  return onAuthStateChanged(auth, callback);
}

// -------------------------------------------------------------
// authErrorMessage(error)
// -------------------------------------------------------------
// Maps Firebase Auth error codes to short, user-friendly messages.
// Helps display clean error alerts instead of raw Firebase codes.
export function authErrorMessage(error) {
  const code = (error?.code || "").toLowerCase();

  const map = {
    "auth/invalid-credential": "Wrong email or password.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
    "auth/email-already-in-use": "Email is already in use.",
    "auth/weak-password": "Password too weak (min 6 characters).",
    "auth/missing-password": "Password cannot be empty.",
    "auth/network-request-failed": "Network error. Try again.",
  };

  return map[code] || "Something went wrong. Please try again.";
}
