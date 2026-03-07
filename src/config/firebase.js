import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDRlXfkpFGQLoX9UVn_iOjFn7Oyvrv_ExQ",
  authDomain: "urbanissuesystem.firebaseapp.com",
  projectId: "urbanissuesystem",
  storageBucket: "urbanissuesystem.firebasestorage.app",
  messagingSenderId: "797746428384",
  appId: "1:797746428384:web:0797095f6037ce923d5385"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
