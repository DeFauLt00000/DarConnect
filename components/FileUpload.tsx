'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, FileImage, FileText } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
}

export default function FileUpload({
  onFileSelect,
  accept = 'image/*,application/pdf',
  maxSize = 5 * 1024 * 1024,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setError(null);

    if (file.size > maxSize) {
      setError('Le fichier est trop volumineux (max 5MB)');
      return;
    }

    const fileType = file.type;
    const acceptedTypes = accept.split(',').map((type) => type.trim());

    const isAccepted = acceptedTypes.some((type) => {
      if (type.startsWith('image/')) {
        return fileType.startsWith('image/');
      }
      if (type === 'application/pdf') {
        return fileType === 'application/pdf';
      }
      return fileType === type;
    });

    if (!isAccepted) {
      setError('Type de fichier non accepté');
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = () => {
    if (!selectedFile) return null;

    if (selectedFile.type.startsWith('image/')) {
      return <FileImage className="w-8 h-8 text-[#c8a96e]" />;
    }

    if (selectedFile.type === 'application/pdf') {
      return <FileText className="w-8 h-8 text-[#c8a96e]" />;
    }

    return <FileText className="w-8 h-8 text-[#c8a96e]" />;
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      {!selectedFile ? (
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[#c8a96e] bg-[rgba(200,169,110,0.1)]'
              : 'border-[rgba(255,255,255,0.12)] hover:border-[#c8a96e]'
          }`}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-[#8b8fa8]" />
          <p className="text-[#f0f0f0] mb-2">
            Glissez et déposez votre fichier ici
          </p>
          <p className="text-[#8b8fa8] text-sm">
            ou cliquez pour sélectionner
          </p>
          <p className="text-[#4a4d5e] text-xs mt-2">
            Max {formatFileSize(maxSize)} • Images et PDF
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getFileIcon()}
              <div>
                <p className="text-[#f0f0f0] font-medium">
                  {selectedFile.name}
                </p>
                <p className="text-[#8b8fa8] text-sm">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleRemove}
              className="p-2 hover:bg-[rgba(239,68,68,0.1)] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[#ef4444]" />
            </motion.button>
          </div>
        </motion.div>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[#ef4444] text-sm mt-2"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
