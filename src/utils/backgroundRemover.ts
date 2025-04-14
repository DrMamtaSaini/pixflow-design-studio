
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
    const result = await segmenter(imageData, {
      threshold: 0.01 // Further lower threshold to catch more of the subject
    });
    
    console.log('Segmentation result:', result);
    
    if (!result || !Array.isArray(result) || result.length === 0) {
      throw new Error('Invalid segmentation result');
    }
    
    // Create a binary mask from all foreground classes
    // Initialize an array filled with zeros (background)
    const maskArray = new Uint8ClampedArray(canvas.width * canvas.height).fill(0);
    
    // Combine masks from multiple relevant classes to create a comprehensive foreground mask
    const relevantClasses = ['person', 'car', 'animal', 'chair', 'table', 'sofa', 'bed', 'plant', 'clothing', 'accessory', 'hair', 'skin'];
    
    // For each segmentation result, check if it's a relevant class or has significant mask data
    for (const segment of result) {
      if (!segment.mask) continue;
      
      // If it's a relevant class OR it has a name that's not "wall", "floor", "ceiling", etc.
      const isRelevant = relevantClasses.includes(segment.label) || 
                        !['wall', 'floor', 'ceiling', 'building', 'sky', 'road', 'ground'].includes(segment.label);
      
      if (isRelevant) {
        // For each pixel in the mask
        for (let i = 0; i < segment.mask.data.length; i++) {
          // If the confidence is above threshold, mark as foreground
          if (segment.mask.data[i] > 0.1) {  // Lower threshold to 0.1 to include more edges
            maskArray[i] = 255; // Mark as foreground (255 = white)
          }
        }
      }
    }
    
    // Create a new canvas for the final output
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const outputCtx = outputCanvas.getContext('2d', { willReadFrequently: true });
    
    if (!outputCtx) throw new Error('Could not get output canvas context');
    
    // Draw the original image
    outputCtx.drawImage(canvas, 0, 0);
    
    // Create a temporary canvas for the mask
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
    
    if (!maskCtx) throw new Error('Could not get mask canvas context');
    
    // Create mask image data
    const maskImgData = maskCtx.createImageData(maskCanvas.width, maskCanvas.height);
    const maskData = maskImgData.data;
    
    // Fill mask with our binary mask data
    for (let i = 0; i < maskArray.length; i++) {
      const idx = i * 4;
      // Set RGB channels
      maskData[idx] = 255;
      maskData[idx + 1] = 255;
      maskData[idx + 2] = 255;
      // Set alpha based on our binary mask
      maskData[idx + 3] = maskArray[i];
    }
    
    // Put the mask image data on the mask canvas
    maskCtx.putImageData(maskImgData, 0, 0);
    
    // Apply a stronger morphological operation to expand the mask
    maskCtx.filter = 'blur(8px)';  // Increase blur radius for better edge handling
    maskCtx.drawImage(maskCanvas, 0, 0);
    
    // Apply a threshold to the blurred mask to create a sharper edge
    const blurredData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    const blurredPixels = blurredData.data;
    
    for (let i = 0; i < blurredPixels.length; i += 4) {
      // Aggressive thresholding to eliminate the dark boundary
      if (blurredPixels[i + 3] > 5) {  // Use an even lower threshold (5) to include more of the boundary
        blurredPixels[i + 3] = 255;
      } else {
        blurredPixels[i + 3] = 0;
      }
    }
    
    maskCtx.putImageData(blurredData, 0, 0);
    
    // Apply a second blur to smooth out the edges after thresholding
    maskCtx.filter = 'blur(2px)';
    maskCtx.drawImage(maskCanvas, 0, 0);
    maskCtx.filter = 'none';
    
    // Apply another threshold to clean up the edges
    const finalData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    const finalPixels = finalData.data;
    
    for (let i = 0; i < finalPixels.length; i += 4) {
      // Make a binary mask (either fully transparent or fully opaque)
      finalPixels[i + 3] = finalPixels[i + 3] > 128 ? 255 : 0;
    }
    
    maskCtx.putImageData(finalData, 0, 0);
    
    // Apply the mask to the original image using globalCompositeOperation
    outputCtx.globalCompositeOperation = 'destination-in';
    outputCtx.drawImage(maskCanvas, 0, 0);
    outputCtx.globalCompositeOperation = 'source-over';
    
    console.log('Mask applied successfully using composite operations');
    
    // Convert canvas to blob with PNG format to preserve transparency
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
