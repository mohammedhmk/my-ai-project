import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDV_XxcNybXND2pNvM5Ufl4T433mo3D4mM",
  authDomain: "my-ai-tasks.firebaseapp.com",
  projectId: "my-ai-tasks",
  storageBucket: "my-ai-tasks.firebasestorage.app",
  messagingSenderId: "759953686250",
  appId: "1:759953686250:web:96b0b2076d1315db4ce193"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);