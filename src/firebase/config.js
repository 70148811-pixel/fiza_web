import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if credentials are still dummy or missing
export const isDemoMode = 
  !firebaseConfig.apiKey || 
  firebaseConfig.apiKey.includes("your_api_key_here") || 
  firebaseConfig.apiKey === "";

let app = null;
let auth = null;
let db = null;
let googleProvider = null;

if (!isDemoMode) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    console.log("🔥 Firebase initialized successfully!");
  } catch (error) {
    console.error("❌ Firebase initialization failed, falling back to Demo Mode:", error);
  }
} else {
  console.warn("✨ Running in DEMO MODE (LocalStorage backend). To use live Firebase, add your keys to the .env file.");
}

export { app, auth, db, googleProvider };
