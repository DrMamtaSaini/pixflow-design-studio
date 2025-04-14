
import { pipeline, env } from '@huggingface/transformers';
import { toast } from 'sonner';

// Configure transformers.js to always download models
env.allowLocalModels = false;
env.useBrowserCache = false;

const MAX_IMAGE_DIMENSION = 1024;

function resizeImageIfNeeded(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);
  return false;
}

export const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob> => {
  try {
    console.log('Starting background removal process...');
    
    // Use webgpu first, with fallback to wasm (both are supported by the library)
    let device = 'webgpu';
    
    // Check if WebGPU is available
    if (!('gpu' in navigator)) {
      console.log('WebGPU not available, falling back to wasm');
      device = 'wasm';
    }
    
    console.log(`Using device: ${device}`);
    
    const segmenter = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512', {
      device: device as 'webgpu' | 'wasm',
    });
    
    // Convert HTMLImageElement to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Resize image if needed and draw it to canvas
    const wasResized = resizeImageIfNeeded(canvas, ctx, imageElement);
    console.log(`Image ${wasResized ? 'was' : 'was not'} resized. Final dimensions: ${canvas.width}x${canvas.height}`);
    
    // Get image data as base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    console.log('Image converted to base64');
    
    // Process the image with the segmentation model
    console.log('Processing with segmentation model...');
    const result = await segmenter(imageData);
    
    console.log('Segmentation result:', result);
    
    if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
      throw new Error('Invalid segmentation result');
    }
    
    // Instead of manipulating the pixels directly, we'll use a more reliable approach 
    // with separate canvases for the image and mask
    
    // Create a new canvas for the final output
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const outputCtx = outputCanvas.getContext('2d', { willReadFrequently: true });
    
    if (!outputCtx) throw new Error('Could not get output canvas context');
    
    // Create a temporary canvas for the mask
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
    
    if (!maskCtx) throw new Error('Could not get mask canvas context');
    
    // Create mask image data
    const maskImgData = maskCtx.createImageData(maskCanvas.width, maskCanvas.height);
    const maskData = maskImgData.data;
    
    // Apply mask to alpha channel
    const maskLength = result[0].mask.data.length;
    const dataLength = maskData.length / 4; // RGBA pixels
    
    // Make sure we don't exceed array bounds
    const minLength = Math.min(maskLength, dataLength);
    
    // Create binary mask with solid values (either fully transparent or fully opaque)
    for (let i = 0; i < minLength; i++) {
      const maskValue = result[0].mask.data[i];
      // Use threshold of 0.5 to make it a binary mask
      const alpha = maskValue < 0.5 ? 255 : 0; // Invert so foreground is kept
      
      const idx = i * 4;
      // Set RGB to white (doesn't matter, only alpha is important)
      maskData[idx] = 255;
      maskData[idx + 1] = 255;
      maskData[idx + 2] = 255;
      // Set alpha based on mask
      maskData[idx + 3] = alpha;
    }
    
    // Put the mask image data on the mask canvas
    maskCtx.putImageData(maskImgData, 0, 0);
    
    // First draw the original image
    outputCtx.drawImage(canvas, 0, 0);
    
    // Then apply the mask using globalCompositeOperation
    outputCtx.globalCompositeOperation = 'destination-in';
    outputCtx.drawImage(maskCanvas, 0, 0);
    
    // Reset composite operation
    outputCtx.globalCompositeOperation = 'source-over';
    
    console.log('Mask applied successfully using composite operations');
    
    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('Successfully created final blob');
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Error removing background:', error);
    toast.error('Failed to remove background. Please try a different image or try again later.');
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
