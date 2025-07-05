"use client";

import { useState, ChangeEvent } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase'; // Adjust path as needed
import { useAuth } from '../authContext'; // Adjust path as needed

export default function FileUpload() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setError(null);
      setSuccessMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !user || !user.email) {
      setError("No file selected or user not logged in properly.");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccessMessage(null);
    setProgress(0);

    // Store files under user's email and original filename
    const storageRef = ref(storage, `${user.email}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const currentProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(currentProgress);
      },
      (uploadError) => {
        console.error("Upload failed:", uploadError);
        setError(`Upload failed: ${uploadError.message}`);
        setUploading(false);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setSuccessMessage(`File uploaded successfully! Download URL: ${downloadURL}`);
          // You might want to store this URL in Firestore or Realtime Database
          // associated with the user if you need to list files with their URLs later.
        } catch (urlError) {
          console.error("Failed to get download URL:", urlError);
          setError(`Upload succeeded, but failed to get download URL: ${urlError}`);
        } finally {
          setUploading(false);
          setFile(null); // Clear the file input
        }
      }
    );
  };

  if (!user) {
    return <p>Please log in to upload files.</p>;
  }

  return (
    <div className="p-4 border rounded shadow-md max-w-md mx-auto mt-10">
      <h2 className="text-xl font-semibold mb-4 text-center">Upload File</h2>
      {error && <p className="text-red-500 bg-red-100 p-2 rounded mb-4">{error}</p>}
      {successMessage && <p className="text-green-500 bg-green-100 p-2 rounded mb-4">{successMessage}</p>}

      <div className="mb-4">
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100"
          disabled={uploading}
        />
      </div>

      {file && !uploading && (
        <p className="text-sm text-gray-600 mb-2">Selected file: {file.name}</p>
      )}

      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-4">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
          <p className="text-sm text-center mt-1">{Math.round(progress)}%</p>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded
                   disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
}
