import { initializeApp } from "firebase/app";
// Importa los servicios que necesites, ej: Auth o Firestore
import { getAuth , GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Usa las variables de entorno de Vite para mayor seguridad
const firebaseConfig = {
  apiKey: "AIzaSyBfzVHmq5dTTgymig8p4r_9bSa3SOvp2Ks",
  authDomain: "nyaflix-392c5.firebaseapp.com",
  projectId: "nyaflix-392c5",
  storageBucket: "nyaflix-392c5.firebasestorage.app",
  messagingSenderId: "196130991624",
  appId: "1:196130991624:web:c5642f053c71a1ade12bbd",
  measurementId: "G-DTVGFFN1E1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();