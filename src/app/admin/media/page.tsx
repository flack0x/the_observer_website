'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Video,
  Copy,
  Trash2,
  Loader2,
  Check,
  X,
  FileWarning,
} from 'lucide-react';
import { ShowForAdmin } from '@/lib/auth';

interface MediaFile {
  name: string;
  url: string;
  type: string;
  size: number;
  created_at: string;
}

export default function MediaLibraryPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fetchFiles = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/media');
      const data = await response.json();

      if (response.ok) {
        setFiles(data.data || []);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to load media files');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      for (const file of Array.from(fileList)) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/admin/media', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to upload file');
        }
      }

      fetchFiles();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(`/api/admin/media?filename=${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchFiles();
      } else {
        const data = await response.json();
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to delete file');
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleUpload(e.dataTransfer.files);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImage = (type: string) => type.startsWith('image/');
  const isVideo = (type: string) => type.startsWith('video/');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold uppercase tracking-wider text-slate-light">
          Media Library
        </h1>
        <p className="text-slate-medium mt-1">
          Upload and manage images and videos for your articles
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Upload zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-colors
          ${dragActive
            ? 'border-tactical-red bg-tactical-red/5'
            : 'border-midnight-600 hover:border-midnight-500'
          }
        `}
      >
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={(e) => handleUpload(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />

        <div className="flex flex-col items-center gap-3">
          {isUploading ? (
            <Loader2 className="h-10 w-10 animate-spin text-tactical-red" />
          ) : (
            <Upload className="h-10 w-10 text-slate-dark" />
          )}
          <div>
            <p className="text-slate-light font-medium">
              {isUploading ? 'Uploading...' : 'Drag and drop files here'}
            </p>
            <p className="text-slate-dark text-sm mt-1">
              or click to browse (max 10MB per file)
            </p>
          </div>
          <p className="text-xs text-slate-dark">
            Supported: JPEG, PNG, GIF, WebP, MP4, WebM
          </p>
        </div>
      </div>

      {/* Files grid */}
      <div className="bg-midnight-800 rounded-xl border border-midnight-700">
        <div className="p-4 border-b border-midnight-700">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-light">
            Uploaded Files ({files.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-tactical-red" />
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-12 text-slate-dark">
            <FileWarning className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No files uploaded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
            {files.map((file) => (
              <div
                key={file.name}
                className="group relative bg-midnight-700 rounded-lg overflow-hidden border border-midnight-600 hover:border-tactical-red/50 transition-colors"
              >
                {/* Preview */}
                <div className="aspect-square relative">
                  {isImage(file.type) ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : isVideo(file.type) ? (
                    <div className="w-full h-full flex items-center justify-center bg-midnight-800">
                      <Video className="h-8 w-8 text-slate-dark" />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-midnight-800">
                      <ImageIcon className="h-8 w-8 text-slate-dark" />
                    </div>
                  )}

                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => copyToClipboard(file.url)}
                      className="p-2 rounded-lg bg-midnight-800 text-slate-light hover:bg-tactical-red transition-colors"
                      title="Copy URL"
                    >
                      {copiedUrl === file.url ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <ShowForAdmin>
                      <button
                        onClick={() => handleDelete(file.name)}
                        className="p-2 rounded-lg bg-midnight-800 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </ShowForAdmin>
                  </div>
                </div>

                {/* File info */}
                <div className="p-2">
                  <p className="text-xs text-slate-light truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-dark">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
