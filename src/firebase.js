// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // ← ADD THIS

const firebaseConfig = {
  apiKey: "AIzaSyCay5sKLrtUZuQbexMLOT2t0gZcnPMIeak",
  authDomain: "trade-journal-app-v2.firebaseapp.com",
  projectId: "trade-journal-app-v2",
  storageBucket: "trade-journal-app-v2.firebasestorage.app",
  messagingSenderId: "317575736751",
  appId: "1:317575736751:web:b60d1b862a56d73f88535a"
};

const app = initializeApp(firebaseConfig);

// Auth exports
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firestore
export const db = getFirestore(app);

// Storage – for images
export const storage = getStorage(app); // ← ADD THIS

// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Persistence failed: multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Persistence not supported in this browser');
    }
  });

console.log("Firebase + Firestore initialized");
