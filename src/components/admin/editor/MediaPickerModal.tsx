'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Image as ImageIcon, Video, Check, Upload } from 'lucide-react';

interface MediaFile {
  name: string;
  url: string;
  type: string;
  size: number;
  created_at: string;
}

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  mediaType?: 'image' | 'video';
}

export function MediaPickerModal({ isOpen, onClose, onSelect, mediaType = 'image' }: MediaPickerModalProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch media files when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  const fetchMedia = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/media');
      if (!response.ok) throw new Error('Failed to fetch media');

      const result = await response.json();
      // Filter by media type
      const filteredFiles = (result.data || []).filter((file: MediaFile) =>
        file.type.startsWith(`${mediaType}/`)
      );
      setFiles(filteredFiles);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith(`${mediaType}/`)) {
      setError(`Please select ${mediaType === 'video' ? 'a video' : 'an image'} file`);
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload');
      }

      const result = await response.json();

      // Add new file to the list and select it
      setFiles(prev => [result.data, ...prev]);
      setSelectedUrl(result.data.url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelect = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      onClose();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl max-h-[80vh] bg-midnight-900 rounded-xl shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-midnight-800 border-b border-midnight-700">
            <h2 className="font-heading text-lg font-bold uppercase tracking-wider text-slate-light">
              Select {mediaType === 'video' ? 'Video' : 'Image'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-midnight-700 text-slate-medium hover:text-slate-light transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Upload section */}
          <div className="px-6 py-4 border-b border-midnight-700">
            <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-midnight-600
                           hover:border-tactical-red cursor-pointer transition-colors bg-midnight-800/50">
              <input
                type="file"
                accept={mediaType === 'video' ? 'video/*' : 'image/*'}
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
              {isUploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-tactical-red" />
                  <span className="text-sm text-slate-medium">Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 text-slate-dark" />
                  <span className="text-sm text-slate-medium">Upload new {mediaType === 'video' ? 'video' : 'image'}</span>
                </>
              )}
            </label>
          </div>

          {/* Error message */}
          {error && (
            <div className="mx-6 mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Media grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-tactical-red" />
              </div>
            ) : files.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-dark">
                {mediaType === 'video' ? (
                  <Video className="h-12 w-12 mb-3 opacity-50" />
                ) : (
                  <ImageIcon className="h-12 w-12 mb-3 opacity-50" />
                )}
                <p>No {mediaType === 'video' ? 'videos' : 'images'} uploaded yet</p>
                <p className="text-sm mt-1">Upload {mediaType === 'video' ? 'a video' : 'an image'} to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {files.map((file) => (
                  <button
                    key={file.name}
                    onClick={() => setSelectedUrl(file.url)}
                    className={`relative aspect-square rounded-lg overflow-hidden bg-midnight-800 border-2 transition-all
                              ${selectedUrl === file.url
                                ? 'border-tactical-red ring-2 ring-tactical-red/50'
                                : 'border-midnight-700 hover:border-midnight-500'
                              }`}
                  >
                    {mediaType === 'video' ? (
                      <div className="w-full h-full flex items-center justify-center bg-midnight-700">
                        <Video className="h-10 w-10 text-slate-dark" />
                      </div>
                    ) : (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    )}

                    {/* Selection indicator */}
                    {selectedUrl === file.url && (
                      <div className="absolute top-2 right-2 p-1 rounded-full bg-tactical-red">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}

                    {/* File info on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent
                                  opacity-0 hover:opacity-100 transition-opacity flex items-end p-2">
                      <div className="text-xs text-white truncate">
                        {formatFileSize(file.size)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-midnight-800 border-t border-midnight-700">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-midnight-700 border border-midnight-500 text-slate-light
                       hover:border-midnight-400 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSelect}
              disabled={!selectedUrl}
              className="px-4 py-2 rounded-lg bg-tactical-red text-white font-medium
                       hover:bg-tactical-red-hover disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors text-sm"
            >
              Select {mediaType === 'video' ? 'Video' : 'Image'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
