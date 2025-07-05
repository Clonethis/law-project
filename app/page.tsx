"use client"; // Required for using hooks like useAuth

import { useAuth } from "./authContext"; // Adjust path as needed
import LoginPage from "./components/Login"; // Adjust path as needed
import FileUpload from "./components/FileUpload"; // Adjust path as needed
import FileList from "./components/FileList"; // Adjust path as needed
import { auth } from "./firebase"; // For sign out
import { signOut } from "firebase/auth";

export default function Home() {
  const { user, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Loading application...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-[family-name:var(--font-geist-sans)]">
      <header className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">File Storage App</h1>
          {user && (
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">Welcome, {user.displayName || user.email}</span>
              <button
                onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto p-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <FileUpload />
          </div>
          <div>
            <FileList />
          </div>
        </div>
      </main>

      <footer className="text-center p-4 mt-10 text-gray-600 text-sm">
        <p>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
        <p>Powered by Firebase and Next.js</p>
      </footer>
    </div>
  );
}
