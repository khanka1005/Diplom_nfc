import { getAuthClient, getFirestoreClient } from "@/firebaseConfig";
import { doc, setDoc, enableNetwork } from "firebase/firestore";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

export const loginUser = async (email: string, password: string) => {
  const auth = getAuthClient();
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  try {
  
  } catch (err) {
    console.warn("⚠️ Firestore enableNetwork (login) failed:", err);
  }

  return userCredential.user;
};

export const registerUser = async (name: string, email: string, password: string) => {
  const auth = getAuthClient();
  const db = getFirestoreClient();

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  try {
    await enableNetwork(db);
  } catch (err) {
    console.warn("⚠️ Firestore enableNetwork (register) failed:", err);
  }

  await setDoc(doc(db, "users", user.uid), {
    name,
    email,
    isAdmin: false,
  });

  return user;
};
