
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ImageUploader from '@/components/ImageUploader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Slider } from '@/components/ui/slider';
import { Download, Trash, ImageIcon, Grid2X2 } from 'lucide-react';
import { toast } from 'sonner';

const BackgroundRemoverPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [bgOption, setBgOption] = useState<string>('transparent');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [checkerboardSize, setCheckerboardSize] = useState<number>(20);
  
  const handleImageUpload = (file: File, imageUrl: string) => {
    setFile(file);
    setImageUrl(imageUrl);
    setResultImage(null);
  };
  
  const handleRemoveBackground = () => {
    if (!file) return;
    
    setIsProcessing(true);
    
    // Mock background removal processing delay
    setTimeout(() => {
      // For demo purposes, we're just using the same image as result
      // In a real implementation, this would use an AI-based background removal API or library
      setResultImage(imageUrl);
      setIsProcessing(false);
      toast.success('Background removed successfully!');
    }, 1500);
  };
  
  const handleDownload = () => {
    if (!resultImage) return;
    
    const a = document.createElement('a');
    a.href = resultImage;
    a.download = 'removed-background.png';
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
    <Layout title="Background Remover" showBackButton>
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Upload Image</h2>
              <ImageUploader onImageUpload={handleImageUpload} />
              
              {file && !resultImage && (
                <Button 
                  onClick={handleRemoveBackground} 
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? 'Processing...' : 'Remove Background'}
                </Button>
              )}
            </div>
          </div>
          
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {resultImage && (
              <>
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Result</h2>
                  <div className="relative">
                    <Tabs defaultValue="preview" className="mb-4">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                        <TabsTrigger value="settings">Background</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="preview" className="p-0">
                        <div 
                          className="border rounded-lg overflow-hidden"
                          style={{
                            background: bgOption === 'transparent' 
                              ? `repeating-comb-matrix(${checkerboardSize}px, ${checkerboardSize}px, #e5e7eb 1px, transparent 1px, transparent ${checkerboardSize}px)` 
                              : bgOption === 'color' ? bgColor : 'none'
                          }}
                        >
                          <img 
                            src={resultImage} 
                            alt="Result" 
                            className="object-contain mx-auto max-h-[400px]" 
                          />
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="settings" className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Background Type</p>
                          <ToggleGroup type="single" value={bgOption} onValueChange={(value) => value && setBgOption(value)}>
                            <ToggleGroupItem value="transparent" title="Transparent">
                              <Grid2X2 className="h-4 w-4 mr-2" />
                              Transparent
                            </ToggleGroupItem>
                            <ToggleGroupItem value="color" title="Solid Color">
                              <ImageIcon className="h-4 w-4 mr-2" />
                              Color
                            </ToggleGroupItem>
                          </ToggleGroup>
                        </div>
                        
                        {bgOption === 'color' && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Background Color</p>
                            <div className="flex items-center gap-4">
                              <div 
                                className="h-8 w-8 rounded-full border"
                                style={{ backgroundColor: bgColor }}
                              />
                              <input 
                                type="color"
                                value={bgColor} 
                                onChange={(e) => setBgColor(e.target.value)}
                                className="h-9 w-full"
                              />
                            </div>
                          </div>
                        )}
                        
                        {bgOption === 'transparent' && (
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <p className="text-sm font-medium">Checkerboard Size</p>
                              <p className="text-sm text-muted-foreground">{checkerboardSize}px</p>
                            </div>
                            <Slider 
                              value={[checkerboardSize]} 
                              onValueChange={(values) => setCheckerboardSize(values[0])}
                              min={10}
                              max={50}
                              step={5}
                            />
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Button 
                    variant="default"
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

export default BackgroundRemoverPage;
