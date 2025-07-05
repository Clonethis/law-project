"use client";

import { useState, ChangeEvent } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase'; // Adjust path as needed
import { useAuth } from '../authContext'; // Adjust path as needed

interface UploadProgress {
  fileName: string;
  progress: number;
  error?: string;
  url?: string;
}

export default function FileUpload() {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileList | null>(null); // Store FileList
  const [uploading, setUploading] = useState(false);
  // Store progress for each file
  const [uploadProgresses, setUploadProgresses] = useState<UploadProgress[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFiles(event.target.files); // Store the whole FileList
      setError(null);
      setSuccessMessage(null);
      setUploadProgresses([]); // Reset progress for new selection
    } else {
      setFiles(null); // Clear selection if no files are chosen
      setUploadProgresses([]);
    }
  };

  const handleUpload = async () => {
    if (!files || files.length === 0 || !user || !user.email) {
      setError("No files selected or user not logged in properly.");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccessMessage(null);

    const initialProgresses: UploadProgress[] = Array.from(files).map(file => ({
      fileName: file.name,
      progress: 0,
    }));
    setUploadProgresses(initialProgresses);

    const uploadPromises = Array.from(files).map(file => {
      return new Promise<void>((resolve, reject) => {
        const storageRef = ref(storage, `${user.email}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const currentProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgresses(prev =>
              prev.map(up =>
                up.fileName === file.name ? { ...up, progress: currentProgress } : up
              )
            );
          },
          (uploadError) => {
            console.error(`Upload failed for ${file.name}:`, uploadError);
            setUploadProgresses(prev =>
              prev.map(up =>
                up.fileName === file.name ? { ...up, error: uploadError.message, progress: 100 } : up
              )
            );
            reject(uploadError); // Propagate error to Promise.all
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              setUploadProgresses(prev =>
                prev.map(up =>
                  up.fileName === file.name ? { ...up, url: downloadURL, progress: 100 } : up
                )
              );
              resolve(); // Resolve promise on successful upload and URL retrieval
            } catch (urlError: any) {
              console.error(`Failed to get download URL for ${file.name}:`, urlError);
              setUploadProgresses(prev =>
                prev.map(up =>
                  up.fileName === file.name ? { ...up, error: `Failed to get URL: ${urlError.message}`, progress: 100 } : up
                )
              );
              reject(urlError); // Propagate error to Promise.all
            }
          }
        );
      });
    });

    try {
      await Promise.all(uploadPromises);
      // Check final statuses from uploadProgresses state
      const finalStatuses = uploadProgresses; // Use the state directly as it's updated
      const successfulCount = finalStatuses.filter(up => up.url && !up.error).length;
      const failedCount = finalStatuses.filter(up => up.error).length;

      if (failedCount > 0) {
        setError(`${failedCount} file(s) failed to upload. Check details above.`);
      }
      if (successfulCount > 0) {
        setSuccessMessage(`${successfulCount} file(s) uploaded successfully!`);
      }
      if (successfulCount === 0 && failedCount === 0 && files.length > 0) {
        // This case might happen if promises resolve but state update for URL/error hasn't completed.
        // Or if there's a logic flaw. For now, assume this means nothing was processed.
        setError("Upload process completed, but no files seem to have been processed successfully or failed explicitly.");
      }

    } catch (error) {
      // This catch block handles errors from Promise.all, typically meaning at least one upload failed critically.
      // Individual errors are already updated in the UI.
      console.error("Overall upload process error:", error);
      // setError("An error occurred during the batch upload. Some files may have failed.");
      // The individual error messages in `uploadProgresses` are more specific.
    } finally {
      setUploading(false);
      setFiles(null); // Clear file selection
      // Do not clear uploadProgresses here, so user can see the status of each file.
      // It will be cleared upon new file selection.
    }
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
          multiple // Allow multiple file selection
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

      {/* Display selected files and individual progress */}
      {files && Array.from(files).map((file, index) => (
        <div key={index} className="mb-2 text-sm">
          <p className="text-gray-700">{file.name} ({Math.round(file.size / 1024)} KB)</p>
          {uploadProgresses.find(up => up.fileName === file.name) && (
            <div className="w-full bg-gray-200 rounded-full h-2 my-1">
              <div
                className={`h-2 rounded-full ${uploadProgresses.find(up => up.fileName === file.name)?.error ? 'bg-red-500' : 'bg-blue-600'}`}
                style={{ width: `${uploadProgresses.find(up => up.fileName === file.name)?.progress || 0}%` }}
              ></div>
            </div>
          )}
          {uploadProgresses.find(up => up.fileName === file.name)?.error && (
            <p className="text-red-500 text-xs">{uploadProgresses.find(up => up.fileName === file.name)?.error}</p>
          )}
        </div>
      ))}


      <button
        onClick={handleUpload}
        disabled={!files || files.length === 0 || uploading} // Check if files exist and not empty
        className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded
                   disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {uploading ? `Uploading ${uploadProgresses.filter(up => !up.url && !up.error).length} file(s)...` : `Upload ${files ? files.length : 0} file(s)`}
      </button>
    </div>
  );
}
