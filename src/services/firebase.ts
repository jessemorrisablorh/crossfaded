import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyARuRLdEEcN4IgFGiTCfnwxNRiwrbohVXU",
  authDomain: "blessed-care-int.firebaseapp.com",
  projectId: "blessed-care-int",
  storageBucket: "blessed-care-int.appspot.com",
  messagingSenderId: "279408409414",
  appId: "1:279408409414:web:656fc3c5a51b5530c38347",
  measurementId: "G-PQ11SQWHGZ",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

