import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ImageUploader from '@/components/ImageUploader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Slider } from '@/components/ui/slider';
import { Download, Trash, ImageIcon, Grid2X2, Loader2, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { removeBackground, loadImage } from '@/utils/backgroundRemover';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

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
  
  const handleRemoveBackground = async () => {
    if (!file || !imageUrl) {
      toast.error('Please upload an image first');
      return;
    }
    
    setIsProcessing(true);
    const toastId = toast.loading('Processing image with Remove.bg API...', { duration: 60000 });
    
    try {
      const image = await loadImage(file);
      const processedImageBlob = await removeBackground(image);
      const processedImageUrl = URL.createObjectURL(processedImageBlob);
      setResultImage(processedImageUrl);
      
      toast.success('Background removed successfully!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to remove background. Please try a different image or try again later.');
    } finally {
      toast.dismiss(toastId);
      setIsProcessing(false);
    }
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
  
  const getBackgroundStyle = () => {
    if (bgOption === 'transparent') {
      return {
        backgroundImage: `linear-gradient(45deg, #e5e7eb 25%, transparent 25%), 
                           linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), 
                           linear-gradient(45deg, transparent 75%, #e5e7eb 75%), 
                           linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)`,
        backgroundSize: `${checkerboardSize * 2}px ${checkerboardSize * 2}px`,
        backgroundPosition: `0 0, 0 ${checkerboardSize}px, ${checkerboardSize}px ${-checkerboardSize}px, ${-checkerboardSize}px 0px`
      };
    } else if (bgOption === 'color') {
      return { backgroundColor: bgColor };
    }
    return {};
  };
  
  return (
    <Layout title="Background Remover" showBackButton>
      <div className="space-y-8">
        <Alert variant="default" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Professional Background Removal</AlertTitle>
          <AlertDescription>
            This tool uses the Remove.bg API to professionally remove backgrounds from your images.
            Upload any image with a clear subject, and the service will automatically remove the background.
            Works best with people, products, animals, cars, and other common subjects.
          </AlertDescription>
        </Alert>
        
        {resultImage && (
          <Alert variant="default" className="mb-6 bg-green-50 border-green-200">
            <Info className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-700">Background removed successfully</AlertTitle>
            <AlertDescription className="text-green-600">
              Your image has been processed using Remove.bg API. You can now customize the background or download the result.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Upload Image</h2>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">Requirements</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4">
                    <h3 className="font-medium mb-2">Browser Requirements</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      This feature requires a modern browser that supports either:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                      <li>WebGPU (Chrome 113+, Edge 113+, or Safari 17+)</li>
                      <li>WebAssembly</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-2">
                      For best results, use high-quality images with good lighting and a clear subject.
                    </p>
                  </PopoverContent>
                </Popover>
              </div>
              <ImageUploader 
                onImageUpload={handleImageUpload} 
                dropzoneText="Upload an image with a clear subject to remove the background"
              />
              
              {file && (
                <Button 
                  onClick={handleRemoveBackground} 
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Remove Background'
                  )}
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
                          style={getBackgroundStyle()}
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
