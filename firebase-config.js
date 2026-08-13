// Firebase Configuration
// Get your credentials from Firebase Console: https://console.firebase.google.com
// Project Settings > General > Web Apps > Copy config

export const firebaseConfig = {
  apiKey: "AIzaSyDemoKeyForTesting123456789012345",
  authDomain: "receipt-system-demo.firebaseapp.com",
  projectId: "receipt-system-demo",
  storageBucket: "receipt-system-demo.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcd"
};

// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, connectAuthEmulator } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore, connectFirestoreEmulator } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable emulators for local development (if needed)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
  } catch (e) {
    // Emulator already connected or not available
  }
  
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (e) {
    // Emulator already connected or not available
  }
}
