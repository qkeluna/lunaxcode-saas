'use client';

import { useState } from 'react';
import FileUpload from './FileUpload';
import FileList from './FileList';
import { FileText } from 'lucide-react';

interface FilesSectionProps {
  projectId: number;
}

export default function FilesSection({ projectId }: FilesSectionProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showUpload, setShowUpload] = useState(false);

  const handleUploadComplete = (file: any) => {
    // Refresh file list
    setRefreshTrigger((prev) => prev + 1);
    // Hide upload form
    setShowUpload(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-gray-600" />
          <h2 className="text-2xl font-bold text-gray-900">Project Files</h2>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            showUpload
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {showUpload ? 'Cancel' : 'Upload File'}
        </button>
      </div>

      {/* Upload section */}
      {showUpload && (
        <div className="pt-4 border-t">
          <FileUpload projectId={projectId} onUploadComplete={handleUploadComplete} />
        </div>
      )}

      {/* Files list */}
      <div className="pt-4 border-t">
        <FileList projectId={projectId} refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
}
