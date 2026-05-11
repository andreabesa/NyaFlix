import { auth } from "../firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from "firebase/auth";

const provider = new GoogleAuthProvider();

// PC
export const loginGoogle = () => {
  return signInWithPopup(auth, provider);
};

// Móvil
export const loginGoogleMobile = () => {
  return signInWithRedirect(auth, provider);
};

// Para recuperar login después del redirect
export const handleRedirectResult = () => {
  return getRedirectResult(auth);
};