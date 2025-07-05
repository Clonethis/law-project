"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase"; // Adjust path as needed
import { useAuth } from "../authContext"; // Adjust path as needed

export default function LoginPage() {
  const { user, loading } = useAuth();

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // User will be redirected or UI will update based on AuthProvider state
    } catch (error) {
      console.error("Error signing in with Google: ", error);
      // Handle errors here, such as displaying a notification to the user
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (user) {
    // User is already signed in, optionally redirect or show a message
    // For now, we'll let the main page handle the redirect logic
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Welcome</h1>
      <p className="mb-8">Please sign in to continue.</p>
      <button
        onClick={handleSignIn}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Sign in with Google
      </button>
    </div>
  );
}
