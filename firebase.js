// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your Firebase configuration (you already have it)
const firebaseConfig = {
  apiKey: "AIzaSyCay5sKLrtUZuQbexMLOT2t0gZcnPMIeak",
  authDomain: "trade-journal-app-v2.firebaseapp.com",
  projectId: "trade-journal-app-v2",
  storageBucket: "trade-journal-app-v2.firebasestorage.app",
  messagingSenderId: "317575736751",
  appId: "1:317575736751:web:b60d1b862a56d73f88535a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth and Google provider for login
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
