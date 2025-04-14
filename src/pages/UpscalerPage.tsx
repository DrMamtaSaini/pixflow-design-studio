
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ImageUploader from '@/components/ImageUploader';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Trash, ZoomIn } from 'lucide-react';
import { toast } from 'sonner';

const UpscalerPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [upscaleFactor, setUpscaleFactor] = useState<string>("2x");
  
  const handleImageUpload = (file: File, imageUrl: string) => {
    setFile(file);
    setImageUrl(imageUrl);
    setResultImage(null);
  };
  
  const handleUpscale = () => {
    if (!file) return;
    
    setIsProcessing(true);
    
    // Mock upscaling processing delay
    setTimeout(() => {
      // For demo purposes, we're just using the same image as result
      // In a real implementation, this would use an AI-based upscaling API or library
      setResultImage(imageUrl);
      setIsProcessing(false);
      toast.success(`Image upscaled to ${upscaleFactor} successfully!`);
    }, 1500);
  };
  
  const handleDownload = () => {
    if (!resultImage) return;
    
    const a = document.createElement('a');
    a.href = resultImage;
    a.download = `upscaled-${upscaleFactor}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Image downloaded successfully!');
  };
  
  const handleReset = () => {
    setFile(null);
    setImageUrl(null);
    setResultImage(null);
    toast.info('Reset successful');
  };
  
  return (
    <Layout title="Image Upscaler" showBackButton>
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Upload Image</h2>
              <ImageUploader 
                onImageUpload={handleImageUpload} 
                dropzoneText="Upload a low resolution image to enhance"
              />
              
              {file && !resultImage && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Upscale Factor</p>
                    <ToggleGroup 
                      type="single" 
                      value={upscaleFactor} 
                      onValueChange={(value) => value && setUpscaleFactor(value)}
                      className="justify-center"
                    >
                      <ToggleGroupItem value="2x" aria-label="2x upscaling">2x</ToggleGroupItem>
                      <ToggleGroupItem value="4x" aria-label="4x upscaling">4x</ToggleGroupItem>
                      <ToggleGroupItem value="8x" aria-label="8x upscaling">8x</ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                  
                  <Button 
                    onClick={handleUpscale} 
                    disabled={isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? 'Processing...' : (
                      <>
                        <ZoomIn className="h-4 w-4 mr-2" />
                        Upscale Image
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {resultImage && (
              <>
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Result</h2>
                  <Tabs defaultValue="after">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="before">Before</TabsTrigger>
                      <TabsTrigger value="after">After ({upscaleFactor})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="before">
                      <div className="border rounded-lg overflow-hidden p-2">
                        <img 
                          src={imageUrl || ''} 
                          alt="Original" 
                          className="object-contain mx-auto max-h-[400px]" 
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="after">
                      <div className="border rounded-lg overflow-hidden p-2">
                        <img 
                          src={resultImage} 
                          alt="Upscaled Result" 
                          className="object-contain mx-auto max-h-[400px]" 
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
                
                <div className="flex gap-4">
                  <Button 
                    onClick={handleDownload} 
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={handleReset} 
                    className="flex-1"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UpscalerPage;
