// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAXSd_WhWKNYG7my15sfG93xN6Eusn_gnw",
  authDomain: "yannawedding-11b85.firebaseapp.com",
  projectId: "yannawedding-11b85",
  storageBucket: "yannawedding-11b85.appspot.com", // <- ito dapat .appspot.com (not .app)
  messagingSenderId: "641003596295",
  appId: "1:641003596295:web:5208fb5452baebbdf1d8a2",
  measurementId: "G-X85SREG142"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export all Firebase services
export { app, analytics, auth, db, storage };
