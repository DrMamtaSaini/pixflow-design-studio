
import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ImageUploaderProps {
  onImageUpload: (file: File, imageUrl: string) => void;
  maxSizeMB?: number;
  acceptedFileTypes?: string;
  className?: string;
  imageClassName?: string;
  dropzoneText?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUpload,
  maxSizeMB = 5,
  acceptedFileTypes = "image/*",
  className = "",
  imageClassName = "",
  dropzoneText = "Drag & drop an image here, or click to browse"
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Check file type
    if (!file.type.match(acceptedFileTypes.replace(/\*/g, '.*'))) {
      toast.error('Invalid file type. Please upload an image file.');
      return;
    }
    
    // Check file size
    if (file.size > maxSizeBytes) {
      toast.error(`File is too large. Maximum size is ${maxSizeMB}MB.`);
      return;
    }
    
    const fileUrl = URL.createObjectURL(file);
    setPreview(fileUrl);
    onImageUpload(file, fileUrl);
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div 
      className={`relative w-full ${className}`}
      onClick={() => fileInputRef.current?.click()}
    >
      {preview ? (
        <div className="relative">
          <img 
            src={preview} 
            alt="Uploaded preview" 
            className={`rounded-lg object-contain max-h-[400px] mx-auto ${imageClassName}`}
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={clearImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div 
          className={`
            border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors
            ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-center text-muted-foreground mb-2">{dropzoneText}</p>
          <p className="text-xs text-muted-foreground">Maximum file size: {maxSizeMB}MB</p>
        </div>
      )}
      <input
        type="file"
        accept={acceptedFileTypes}
        className="hidden"
        onChange={handleFileInput}
        ref={fileInputRef}
      />
    </div>
  );
};

export default ImageUploader;
