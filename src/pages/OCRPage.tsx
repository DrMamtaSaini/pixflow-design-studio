
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ImageUploader from '@/components/ImageUploader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Download } from 'lucide-react';
import { toast } from 'sonner';

const OCRPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [language, setLanguage] = useState<string>('eng');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  const handleImageUpload = (file: File, imageUrl: string) => {
    setFile(file);
    setImageUrl(imageUrl);
    setExtractedText('');
  };
  
  const handleExtractText = () => {
    if (!file) return;
    
    setIsProcessing(true);
    
    // Mock OCR processing delay
    setTimeout(() => {
      // For demo purposes, we're just setting some sample text
      // In a real implementation, this would use an OCR API or library
      const sampleTexts: Record<string, string> = {
        'eng': "This is a sample extracted text from your image. In a real application, this would use OCR technology to extract actual text from the uploaded image.",
        'hin': "यह आपकी छवि से निकाला गया एक नमूना पाठ है। एक वास्तविक अनुप्रयोग में, यह अपलोड की गई छवि से वास्तविक पाठ निकालने के लिए OCR तकनीक का उपयोग करेगा।",
        'spa': "Este es un texto de muestra extraído de su imagen. En una aplicación real, esto usaría tecnología OCR para extraer el texto real de la imagen cargada.",
      };
      
      setExtractedText(sampleTexts[language] || sampleTexts.eng);
      setIsProcessing(false);
      toast.success('Text extracted successfully!');
    }, 1500);
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
                    <SelectItem value="spa">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
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
