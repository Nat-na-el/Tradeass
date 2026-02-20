// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCay5sKLrtUZuQbexMLOT2t0gZcnPMIeak",
  authDomain: "trade-journal-app-v2.firebaseapp.com",
  projectId: "trade-journal-app-v2",
  storageBucket: "trade-journal-app-v2.firebasestorage.app",
  messagingSenderId: "317575736751",
  appId: "1:317575736751:web:b60d1b862a56d73f88535a"
};

const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firestore Database
export const db = getFirestore(app);

// Enable offline persistence (very important for reliability)
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('Persistence is not available in this browser.');
    }
  });

console.log("Firebase initialized successfully");
