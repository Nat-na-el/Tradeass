import React from "react";
import { Navigate } from "react-router-dom";
import { auth } from "./firebase"; // your Firebase config
import { useAuthState } from "react-firebase-hooks/auth";

export default function PrivateRoute({ children }) {
  const [user, loading] = useAuthState(auth);

  if (loading) return <div>Loading...</div>; // show a loader while Firebase checks

  if (!user) return <Navigate to="/login" replace />; // redirect if not logged in

  return children; // render the protected page
}
