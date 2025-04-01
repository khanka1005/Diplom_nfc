import { getAuthClient, getFirestoreClient } from "@/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

export const loginUser = async (email: string, password: string) => {
  const auth = getAuthClient(); // ✅ safe in browser
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const registerUser = async (name: string, email: string, password: string) => {
  const auth = getAuthClient();
  const db = getFirestoreClient();

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await setDoc(doc(db, "users", user.uid), {
    name,
    email,
    isAdmin: false,
  });

  return user;
};
