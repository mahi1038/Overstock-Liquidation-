
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBAOxddgOVVsUO3iJ94L4KXg40D8dVRZiY",
  authDomain: "ai-overstock-liquidation.firebaseapp.com",
  projectId: "ai-overstock-liquidation",
  storageBucket: "ai-overstock-liquidation.firebasestorage.app",
  messagingSenderId: "861741958630",
  appId: "1:861741958630:web:dc42bd516a7657b51f4227",
  measurementId: "G-TG4FM7RBX6"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

