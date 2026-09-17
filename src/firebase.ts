import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAFQILkNF1c9xVR36EmIJ5g0N9JHHvlOAU",
  authDomain: "danielvalevm.firebaseapp.com",
  projectId: "danielvalevm",
  storageBucket: "danielvalevm.firebasestorage.app",
  messagingSenderId: "771938901993",
  appId: "1:771938901993:web:d9da0df70ae290f953f578",
  measurementId: "G-WFDL3YK87H"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);
