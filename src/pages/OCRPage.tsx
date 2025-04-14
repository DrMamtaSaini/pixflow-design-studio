
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ImageUploader from '@/components/ImageUploader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Download, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { createWorker } from 'tesseract.js';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';

const OCRPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [language, setLanguage] = useState<string>('hin');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Advanced OCR settings
  const [enhanceHandwriting, setEnhanceHandwriting] = useState<boolean>(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(60);
  
  const handleImageUpload = (file: File, imageUrl: string) => {
    setFile(file);
    setImageUrl(imageUrl);
    setExtractedText('');
  };
  
  const preprocessImageForOCR = async (imageUrl: string): Promise<string> => {
    if (!enhanceHandwriting) return imageUrl;
    
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageUrl);
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw original image
        ctx.drawImage(img, 0, 0);
        
        // Apply basic preprocessing for handwritten text
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Increase contrast and apply binarization for better OCR
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          const newVal = avg > 150 ? 255 : 0; // Simple threshold
          
          data[i] = newVal;     // R
          data[i + 1] = newVal; // G
          data[i + 2] = newVal; // B
        }
        
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      
      img.src = imageUrl;
    });
  };
  
  const handleExtractText = async () => {
    if (!file || !imageUrl) {
      toast.error('Please upload an image first');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Apply preprocessing if enhanceHandwriting is true
      const processedImageUrl = await preprocessImageForOCR(imageUrl);
      
      // Configure worker with proper typing for options
      const worker = await createWorker({
        langPath: 'https://tessdata.projectnaptha.com/4.0.0',
        logger: m => console.log(m)
      });
      
      // Load language data
      await worker.loadLanguage(language);
      await worker.initialize(language);
      
      // Set additional parameters for better handwriting recognition
      await worker.setParameters({
        tessedit_pageseg_mode: '6', // As a string to avoid TS errors
        tessedit_char_whitelist: '',
        tessedit_ocr_engine_mode: '2', // Use LSTM only
        preserve_interword_spaces: '1',
      });
      
      // Recognize text
      const result = await worker.recognize(processedImageUrl);
      setExtractedText(result.data.text);
      
      // Clean up
      await worker.terminate();
      toast.success('Text extracted successfully!');
    } catch (error) {
      console.error('OCR Error:', error);
      toast.error('Failed to extract text. Please try another image.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCopyText = () => {
    navigator.clipboard.writeText(extractedText);
    toast.success('Text copied to clipboard!');
  };
  
  const handleDownloadText = () => {
    const element = document.createElement('a');
    const file = new Blob([extractedText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = 'extracted-text.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Text downloaded successfully!');
  };
  
  return (
    <Layout title="OCR Tool" showBackButton>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6 animate-fade-in">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Upload Image</h2>
            <ImageUploader onImageUpload={handleImageUpload} />
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eng">English</SelectItem>
                    <SelectItem value="hin">Hindi (Devanagari)</SelectItem>
                    <SelectItem value="hin+eng">Hindi + English</SelectItem>
                    <SelectItem value="san">Sanskrit</SelectItem>
                    <SelectItem value="spa">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="flex-shrink-0">
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <h4 className="font-medium">OCR Settings</h4>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="enhance-handwriting" 
                        checked={enhanceHandwriting}
                        onCheckedChange={(checked) => setEnhanceHandwriting(checked as boolean)}
                      />
                      <Label htmlFor="enhance-handwriting">Enhance handwriting recognition</Label>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="confidence">Confidence threshold: {confidenceThreshold}%</Label>
                      </div>
                      <Slider
                        id="confidence"
                        min={0}
                        max={100}
                        step={5}
                        value={[confidenceThreshold]}
                        onValueChange={(value) => setConfidenceThreshold(value[0])}
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button 
                onClick={handleExtractText} 
                disabled={!file || isProcessing}
                className="flex-1"
              >
                {isProcessing ? 'Processing...' : 'Extract Text'}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Extracted Text</h2>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleCopyText}
                disabled={!extractedText}
                title="Copy text"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleDownloadText}
                disabled={!extractedText}
                title="Download as text file"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Textarea
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
            placeholder="Extracted text will appear here..."
            className="h-[300px] font-mono"
          />
        </div>
      </div>
    </Layout>
  );
};

export default OCRPage;
