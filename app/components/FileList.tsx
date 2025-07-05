"use client";

import { useState, useEffect } from 'react';
import { ref, listAll, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase'; // Adjust path as needed
import { useAuth } from '../authContext'; // Adjust path as needed

interface FileItem {
  name: string;
  url: string;
  fullPath: string;
}

export default function FileList() {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null); // Stores name of file being deleted

  const fetchFiles = async () => {
    if (!user || !user.email) {
      setFiles([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const userFolderRef = ref(storage, user.email);
      const result = await listAll(userFolderRef);

      const filesData = await Promise.all(
        result.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return { name: itemRef.name, url, fullPath: itemRef.fullPath };
        })
      );
      setFiles(filesData);
    } catch (e: any) {
      console.error("Error fetching files:", e);
      setError(`Error fetching files: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [user]); // Refetch files if user changes

  const handleDelete = async (fileFullPath: string, fileName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${fileName}?`)) {
      return;
    }
    setDeleting(fileName);
    setError(null);
    try {
      const fileRef = ref(storage, fileFullPath);
      await deleteObject(fileRef);
      setFiles(files.filter(f => f.fullPath !== fileFullPath)); // Update UI
    } catch (e: any) {
      console.error("Error deleting file:", e);
      setError(`Error deleting file ${fileName}: ${e.message}`);
    } finally {
      setDeleting(null);
    }
  };


  if (!user) {
    return <p className="text-center mt-10">Please log in to view your files.</p>;
  }

  if (loading) {
    return <p className="text-center mt-10">Loading files...</p>;
  }

  if (error) {
    return <p className="text-red-500 bg-red-100 p-3 rounded text-center mt-10">{error}</p>;
  }

  return (
    <div className="p-4 border rounded shadow-md max-w-2xl mx-auto mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Your Stored Files</h2>
        <button
          onClick={fetchFiles}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm
                     disabled:bg-gray-400"
        >
          Refresh List
        </button>
      </div>

      {files.length === 0 && !loading && (
        <p className="text-gray-600 text-center py-4">You have no files stored.</p>
      )}

      {files.length > 0 && (
        <ul className="space-y-3">
          {files.map((file) => (
            <li
              key={file.fullPath}
              className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded border"
            >
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline truncate mr-4"
                download={file.name} // Suggests original filename for download
              >
                {file.name}
              </a>
              <button
                onClick={() => handleDelete(file.fullPath, file.name)}
                disabled={deleting === file.name}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs
                           disabled:bg-gray-400 disabled:cursor-wait"
              >
                {deleting === file.name ? 'Deleting...' : 'Delete'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
