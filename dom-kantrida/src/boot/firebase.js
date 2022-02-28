import {
  initializeApp
} from "firebase/app";
import {
  getFirestore
} from "firebase/firestore";
import {
  getAuth
} from "firebase/auth";

const firebaseConfig = {
  // API KEY
};

let firebaseApp = initializeApp(firebaseConfig);
let db = getFirestore(firebaseApp);
let auth = getAuth(firebaseApp);

export {
  firebaseApp,
  db,
  auth,
  firebaseConfig
};
