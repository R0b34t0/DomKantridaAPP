import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.SENDER_ID,
  appId: process.env.APP_ID,
};

let firebaseApp = initializeApp(firebaseConfig);
let db = getFirestore(firebaseApp);
let auth = getAuth(firebaseApp);

const user = () => {
  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(
      auth,
      (userFirebase) => {
        unsub();
        resolve(userFirebase);
      },
      reject
    );
  });
};

export { firebaseApp, db, auth, firebaseConfig, user };
