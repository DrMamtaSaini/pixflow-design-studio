
import { toast } from 'sonner';

// Use the API key directly since environment variable setup is causing issues
const API_KEY = "dJp25Nf5w9eZd5yh92xajEJH";
const REMOVE_BG_API_URL = "https://api.remove.bg/v1.0/removebg";

export const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob> => {
  try {
    console.log('Starting background removal with Remove.bg API...');
    
    // Convert the image to a blob
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    canvas.width = imageElement.naturalWidth;
    canvas.height = imageElement.naturalHeight;
    ctx.drawImage(imageElement, 0, 0);
    
    // Get image as blob
    const imageBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else throw new Error('Failed to create blob from image');
      }, 'image/jpeg', 0.95);
    });
    
    // Create form data for the API request
    const formData = new FormData();
    formData.append('image_file', imageBlob, 'image.jpg');
    formData.append('size', 'auto');
    formData.append('format', 'auto');
    
    console.log('Sending request to Remove.bg API...');
    
    // Send the request to Remove.bg API
    const response = await fetch(REMOVE_BG_API_URL, {
      method: 'POST',
      headers: {
        'X-Api-Key': API_KEY,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Remove.bg API error:', errorData);
      throw new Error(`API error: ${response.status} - ${errorData.errors?.[0]?.title || response.statusText}`);
    }
    
    // Get the processed image blob
    const resultBlob = await response.blob();
    console.log('Successfully received Remove.bg API response');
    
    return resultBlob;
  } catch (error) {
    console.error('Error removing background:', error);
    toast.error('Failed to remove background. Please try again later.');
    throw error;
  }
};

export const loadImage = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};
