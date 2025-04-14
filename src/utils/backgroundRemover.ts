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
    console.log('Starting advanced background removal process...');
    
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
    const result = await segmenter(imageData, {
      threshold: 0.005 // Even lower threshold to catch more of the subject
    });
    
    console.log('Segmentation result:', result);
    
    if (!result || !Array.isArray(result) || result.length === 0) {
      throw new Error('Invalid segmentation result');
    }
    
    // More comprehensive list of relevant classes for foreground detection
    const relevantClasses = [
      'person', 'car', 'animal', 'chair', 'table', 'sofa', 'bed', 
      'plant', 'clothing', 'accessory', 'hair', 'skin', 'face', 
      'arm', 'leg', 'hand', 'head', 'foot', 'object'
    ];
    
    // Initialize a more precise mask array
    const maskArray = new Uint8ClampedArray(canvas.width * canvas.height).fill(0);
    
    // Advanced mask creation
    for (const segment of result) {
      if (!segment.mask) continue;
      
      const isRelevant = 
        relevantClasses.includes(segment.label) || 
        !['wall', 'floor', 'ceiling', 'building', 'sky', 'road', 'ground', 'background'].includes(segment.label);
      
      if (isRelevant) {
        for (let i = 0; i < segment.mask.data.length; i++) {
          // More aggressive foreground detection
          if (segment.mask.data[i] > 0.05) {
            maskArray[i] = 255;
          }
        }
      }
    }
    
    // Create output canvas
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const outputCtx = outputCanvas.getContext('2d', { willReadFrequently: true });
    
    if (!outputCtx) throw new Error('Could not get output canvas context');
    
    // Draw the original image
    outputCtx.drawImage(canvas, 0, 0);
    
    // Advanced mask processing
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
    
    if (!maskCtx) throw new Error('Could not get mask canvas context');
    
    const maskImgData = maskCtx.createImageData(maskCanvas.width, maskCanvas.height);
    const maskData = maskImgData.data;
    
    // Enhance mask with more detailed alpha channel
    for (let i = 0; i < maskArray.length; i++) {
      const idx = i * 4;
      maskData[idx] = 255;     // R
      maskData[idx + 1] = 255; // G
      maskData[idx + 2] = 255; // B
      maskData[idx + 3] = maskArray[i]; // Alpha
    }
    
    maskCtx.putImageData(maskImgData, 0, 0);
    
    // Multiple passes of edge refinement
    maskCtx.filter = 'blur(12px)';
    maskCtx.drawImage(maskCanvas, 0, 0);
    
    // Second pass of thresholding
    const blurredData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    const blurredPixels = blurredData.data;
    
    for (let i = 0; i < blurredPixels.length; i += 4) {
      blurredPixels[i + 3] = blurredPixels[i + 3] > 10 ? 255 : 0;
    }
    
    maskCtx.putImageData(blurredData, 0, 0);
    
    // Apply refined mask to original image
    outputCtx.globalCompositeOperation = 'destination-in';
    outputCtx.drawImage(maskCanvas, 0, 0);
    outputCtx.globalCompositeOperation = 'source-over';
    
    console.log('Advanced mask applied successfully');
    
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
