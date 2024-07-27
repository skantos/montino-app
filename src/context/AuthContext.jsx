import React, { createContext, useContext, useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export const AuthContext = createContext();

export function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        const userDoc = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          setRole(docSnap.data().rolUsuario);
        } else {
          setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      setUser(userCredential.user);

      const userDoc = doc(db, "users", userCredential.user.uid);
      const docSnap = await getDoc(userDoc);
      if (docSnap.exists()) {
        setRole(docSnap.data().rolUsuario);
      } else {
        setRole(null);
      }
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, signIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function UserAuth() {
  return useContext(AuthContext);
}
