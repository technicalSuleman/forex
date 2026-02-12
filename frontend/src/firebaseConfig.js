import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCUsrusY6KpUczhMCooV_zwdQpNFFxw1ok",
  authDomain: "forex-ce03f.firebaseapp.com",
  databaseURL: "https://forex-ce03f-default-rtdb.firebaseio.com",
  projectId: "forex-ce03f",
  storageBucket: "forex-ce03f.firebasestorage.app",
  messagingSenderId: "91185515924",
  appId: "1:91185515924:web:45c8f5234cba51b559d381",
  measurementId: "G-5W6HYYBMEP",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database };
