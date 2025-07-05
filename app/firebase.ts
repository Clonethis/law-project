// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// IMPORTANT: Replace this with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "EXAMPLE_API_KEY",
  authDomain: "EXAMPLE_AUTH_DOMAIN",
  projectId: "EXAMPLE_PROJECT_ID",
  storageBucket: "EXAMPLE_STORAGE_BUCKET",
  messagingSenderId: "EXAMPLE_MESSAGING_SENDER_ID",
  appId: "EXAMPLE_APP_ID"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const storage = getStorage(app);

export { app, auth, storage };
