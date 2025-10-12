'use client';

import { useState, useEffect } from 'react';
import { FileIcon, Image as ImageIcon, File as FileGeneric, Download, ExternalLink } from 'lucide-react';

interface File {
  id: number;
  filename: string;
  filepath: string;
  filesize: number;
  mimetype: string;
  uploadedBy: string;
  createdAt: number;
}

interface FileListProps {
  projectId: number;
  refreshTrigger?: number;
}

export default function FileList({ projectId, refreshTrigger = 0 }: FileListProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles();
  }, [projectId, refreshTrigger]);

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/upload?projectId=${projectId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }

      const data = await response.json();
      setFiles(data.files || []);
    } catch (err: any) {
      console.error('Error fetching files:', err);
      setError(err.message || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number) => {
    // Convert seconds to milliseconds if needed
    const ms = timestamp > 10000000000 ? timestamp : timestamp * 1000;
    return new Date(ms).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) {
      return <ImageIcon className="w-8 h-8 text-blue-600" />;
    }
    return <FileGeneric className="w-8 h-8 text-gray-600" />;
  };

  const handleDownload = (file: File) => {
    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = file.filepath;
    link.download = file.filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-sm text-gray-600 mt-4">Loading files...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileGeneric className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p>No files uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {files.map((file) => (
        <div
          key={file.id}
          className="bg-white border rounded-lg p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-4">
            {/* File icon */}
            <div className="flex-shrink-0">{getFileIcon(file.mimetype)}</div>

            {/* File info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {file.filename}
              </h4>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-gray-500">
                  {formatFileSize(file.filesize)}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">
                  {formatDate(file.createdAt)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownload(file)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Download file"
              >
                <Download className="w-5 h-5" />
              </button>
              {file.mimetype.startsWith('image/') && (
                <a
                  href={file.filepath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="View file"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
