import { db } from "../firebase";
import { doc, setDoc,getDoc } from "firebase/firestore";

export const createUserProfile = async (user) => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);

  await setDoc(userRef, {
    name: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    bio: "",
  }, { merge: true });
};

export const getUserProfile = async (uid) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  return snap.exists() ? snap.data() : null;
};