// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
  
const firebaseConfig = {
  apiKey: "AIzaSyAQkOk7w9JoeWC9c0cjjCZqYZmdSYocWps",
  authDomain: "financetracker-bb2a1.firebaseapp.com",
  projectId: "financetracker-bb2a1",
  storageBucket: "financetracker-bb2a1.firebasestorage.app",
  messagingSenderId: "568135436161",
  appId: "1:568135436161:web:3e91dbb10f6dcbdf6f8a80",
  measurementId: "G-XVL8SGED7R",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
export { auth, googleProvider as provider, signInWithPopup, signOut };
