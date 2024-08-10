import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAd2fMjPse2_fdlaVpa5Y7VyDozuRcelkM",
  authDomain: "base-de-prueba-cee39.firebaseapp.com",
  projectId: "base-de-prueba-cee39",
  storageBucket: "base-de-prueba-cee39.appspot.com",
  messagingSenderId: "742708394755",
  appId: "1:742708394755:web:dfca938eba263462b40736",
  measurementId: "G-N6G9KHCEXD"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
export const messaging = getMessaging(app);
