// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDsTH2CwM_K_HCI_Sb_fxQwBW2SVSkE-qg",
  authDomain: "webestoque-665aa.firebaseapp.com",
  projectId: "webestoque-665aa",
  storageBucket: "webestoque-665aa.firebasestorage.app",
  messagingSenderId: "151416083938",
  appId: "1:151416083938:web:7a45bf567ae8001fe215bb",
  measurementId: "G-7D6XW089LN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export {db, auth, storage}; 