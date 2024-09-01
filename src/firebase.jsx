import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyAP7Af1h_-zBmBfL_A5K2uuJsJDFuOel0c",
    authDomain: "local-js-d7712.firebaseapp.com",
    databaseURL: "https://local-js-d7712-default-rtdb.firebaseio.com",
    projectId: "local-js-d7712",
    storageBucket: "local-js-d7712.appspot.com",
    messagingSenderId: "200538761653",
    appId: "1:200538761653:web:571a969ac8a572328451fc",
    measurementId: "G-XXD5WT5TV1"
  };
  

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
export const messaging = getMessaging(app);
