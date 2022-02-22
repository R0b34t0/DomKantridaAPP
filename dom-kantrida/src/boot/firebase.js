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
  apiKey: "AIzaSyBG7H711L0O5DPVz-TqRCGC-_b96W2kWec",
  authDomain: "dom-kantrida.firebaseapp.com",
  projectId: "dom-kantrida",
  storageBucket: "dom-kantrida.appspot.com",
  messagingSenderId: "89658383943",
  appId: "1:89658383943:web:0d24c894e0680c8e2b9b62"
};

let firebaseApp = initializeApp(firebaseConfig);
let db = getFirestore(firebaseApp);
let auth = getAuth();

export {
  firebaseApp,
  db,
  auth
};
