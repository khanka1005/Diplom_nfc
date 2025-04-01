import { getAuthClient, getFirestoreClient } from "@/firebaseConfig";


import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
const auth = getAuthClient();
const db = getFirestoreClient();
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch  {
    throw new Error("Login failed. Please check your credentials.");
  }
};

export const registerUser = async (name: string, email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store user data in Firestore
    await setDoc(doc(db, "users", user.uid), {
      name,
      email,
      isAdmin: false,
    });

    return user;
  } catch  {
    throw new Error("Registration failed. Try again.");
  }
};
