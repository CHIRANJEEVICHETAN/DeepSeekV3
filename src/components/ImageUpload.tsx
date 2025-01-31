import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image as ImageIcon, X } from 'lucide-react';

interface ImageUploadProps {
  onImageUpload: (file: File, imageUrl: string) => void;
  selectedImage: File | null;
  onClearImage: () => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  selectedImage,
  onClearImage,
}) => {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const imageUrl = URL.createObjectURL(file);
      onImageUpload(file, imageUrl);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1,
  });

  return (
    <div className="relative">
      {selectedImage ? (
        <div className="relative mb-2">
          <img
            src={URL.createObjectURL(selectedImage)}
            alt="Preview"
            className="max-h-32 rounded-lg object-contain"
          />
          <button
            onClick={onClearImage}
            className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-4 mb-2 transition-colors cursor-pointer
            ${isDragActive
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-gray-600 hover:border-blue-500'
            }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center text-gray-400">
            <ImageIcon className="w-6 h-6 mb-2" />
            <p className="text-sm text-center">
              {isDragActive
                ? 'Drop the image here'
                : 'Drag & drop an image here, or click to select'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};