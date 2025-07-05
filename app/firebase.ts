// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// IMPORTANT: Replace this with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBNVFDT38ePrNyn7flZRBypUQXClrxaZ_I",
  authDomain: "law-project-vit-and-jiri.firebaseapp.com",
  projectId: "law-project-vit-and-jiri",
  storageBucket: "law-project-vit-and-jiri.firebasestorage.app",
  messagingSenderId: "28277156809",
  appId: "1:28277156809:web:3be40a4eaa7cdc99951618",
  measurementId: "G-NHZ744FHW7"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const analytics = getAnalytics(app);
const storage = getStorage(app);

export { app, auth, storage,analytics };
