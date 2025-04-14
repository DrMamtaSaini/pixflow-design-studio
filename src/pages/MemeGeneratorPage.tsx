
import React, { useState, useRef, useEffect } from 'react';
import Layout from '@/components/Layout';
import ImageUploader from '@/components/ImageUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Download, Trash, Images, Upload } from 'lucide-react';
import { toast } from 'sonner';

// Sample meme templates
const memeTemplates = [
  { id: 'drake', name: 'Drake', url: 'https://imgflip.com/s/meme/Drake-Hotline-Bling.jpg' },
  { id: 'distracted', name: 'Distracted Boyfriend', url: 'https://imgflip.com/s/meme/Distracted-Boyfriend.jpg' },
  { id: 'button', name: 'Two Buttons', url: 'https://imgflip.com/s/meme/Two-Buttons.jpg' },
  { id: 'change', name: 'Change My Mind', url: 'https://imgflip.com/s/meme/Change-My-Mind.jpg' },
  { id: 'doge', name: 'Doge', url: 'https://imgflip.com/s/meme/Doge.jpg' },
];

const MemeGeneratorPage = () => {
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [topText, setTopText] = useState<string>('');
  const [bottomText, setBottomText] = useState<string>('');
  const [fontFamily, setFontFamily] = useState<string>('Impact');
  const [fontSize, setFontSize] = useState<number>(32);
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [strokeColor, setStrokeColor] = useState<string>('#000000');
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  
  const handleTemplateSelect = (templateId: string) => {
    const template = memeTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setImageUrl(template.url);
      setCustomFile(null);
      setCustomImageUrl(null);
      
      // Pre-load the image
      if (!imageRef.current) {
        imageRef.current = new Image();
      }
      imageRef.current.src = template.url;
    }
  };
  
  const handleCustomImageUpload = (file: File, imageUrl: string) => {
    setCustomFile(file);
    setCustomImageUrl(imageUrl);
    setImageUrl(imageUrl);
    setSelectedTemplate(null);
    
    // Pre-load the image
    if (!imageRef.current) {
      imageRef.current = new Image();
    }
    imageRef.current.src = imageUrl;
  };
  
  const generateMeme = () => {
    if (!imageUrl || !canvasRef.current) {
      toast.error('Please select a template or upload an image first');
      return;
    }
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Use the current image reference or create a new one
    const img = imageRef.current || new Image();
    if (!imageRef.current) {
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
      imageRef.current = img;
    }
    
    // Make sure image is loaded before drawing
    if (img.complete) {
      drawMeme(img, ctx, canvas);
    } else {
      img.onload = () => drawMeme(img, ctx, canvas);
      img.onerror = () => {
        toast.error('Error loading image. Please try a different image or template.');
      };
    }
  };
  
  const drawMeme = (img: HTMLImageElement, ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Set canvas dimensions to match image
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Draw the image on the canvas
    ctx.drawImage(img, 0, 0);
    
    // Configure text settings
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = textColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    
    // Draw top text
    if (topText) {
      const x = canvas.width / 2;
      const y = fontSize + 10;
      ctx.fillText(topText, x, y);
      ctx.strokeText(topText, x, y);
    }
    
    // Draw bottom text
    if (bottomText) {
      const x = canvas.width / 2;
      const y = canvas.height - 20;
      ctx.fillText(bottomText, x, y);
      ctx.strokeText(bottomText, x, y);
    }
    
    toast.success('Meme generated successfully!');
  };
  
  const handleDownload = () => {
    if (!canvasRef.current) {
      toast.error('No meme generated yet');
      return;
    }
    
    // Check if canvas has content
    const canvas = canvasRef.current;
    try {
      // Get a sample pixel to check if canvas has content
      const pixel = canvas.getContext('2d')?.getImageData(1, 1, 1, 1);
      if (!pixel || !pixel.data[3]) { // Check alpha value
        toast.error('Please generate a meme first');
        return;
      }
      
      // Convert canvas to PNG
      const dataUrl = canvas.toDataURL('image/png');
      
      // Create download link
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'meme.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success('Meme downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download. Please generate a meme first.');
    }
  };
  
  const handleReset = () => {
    setCustomFile(null);
    setCustomImageUrl(null);
    setSelectedTemplate(null);
    setImageUrl(null);
    setTopText('');
    setBottomText('');
    setFontFamily('Impact');
    setFontSize(32);
    setTextColor('#ffffff');
    setStrokeColor('#000000');
    setStrokeWidth(2);
    
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    
    imageRef.current = null;
    
    toast.info('Reset successful');
  };
  
  // Auto-generate meme when parameters change
  useEffect(() => {
    if (imageUrl && (topText || bottomText)) {
      const debounceTimer = setTimeout(() => {
        generateMeme();
      }, 500);
      
      return () => clearTimeout(debounceTimer);
    }
  }, [imageUrl, topText, bottomText, fontFamily, fontSize, textColor, strokeColor, strokeWidth]);
  
  return (
    <Layout title="Meme Generator" showBackButton>
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6 animate-fade-in">
            <Tabs defaultValue="templates">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="templates">
                  <Images className="h-4 w-4 mr-2" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="custom">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="templates" className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {memeTemplates.map(template => (
                    <div 
                      key={template.id}
                      className={`
                        border rounded-lg overflow-hidden cursor-pointer transition-all
                        ${selectedTemplate === template.id ? 'ring-2 ring-primary' : 'hover:border-primary/50'}
                      `}
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <div className="aspect-video relative">
                        <img 
                          src={template.url} 
                          alt={template.name} 
                          className="object-cover w-full h-full" 
                        />
                      </div>
                      <div className="p-2 text-center text-sm truncate">
                        {template.name}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="custom">
                <ImageUploader 
                  onImageUpload={handleCustomImageUpload} 
                  dropzoneText="Upload your own image for a meme"
                />
              </TabsContent>
            </Tabs>
            
            {imageUrl && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="top-text">Top Text</Label>
                    <Input
                      id="top-text"
                      value={topText}
                      onChange={(e) => setTopText(e.target.value)}
                      placeholder="Enter top text..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bottom-text">Bottom Text</Label>
                    <Input
                      id="bottom-text"
                      value={bottomText}
                      onChange={(e) => setBottomText(e.target.value)}
                      placeholder="Enter bottom text..."
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="font-family">Font</Label>
                    <Select value={fontFamily} onValueChange={setFontFamily}>
                      <SelectTrigger id="font-family">
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Impact">Impact</SelectItem>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Comic Sans MS">Comic Sans</SelectItem>
                        <SelectItem value="Helvetica">Helvetica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="font-size">Font Size</Label>
                      <span className="text-sm text-muted-foreground">{fontSize}px</span>
                    </div>
                    <Slider
                      id="font-size"
                      value={[fontSize]}
                      onValueChange={(values) => setFontSize(values[0])}
                      min={16}
                      max={72}
                      step={2}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="text-color">Text Color</Label>
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-8 w-8 rounded-full border"
                        style={{ backgroundColor: textColor }}
                      />
                      <input 
                        id="text-color"
                        type="color"
                        value={textColor} 
                        onChange={(e) => setTextColor(e.target.value)}
                        className="h-9 w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stroke-color">Stroke Color</Label>
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-8 w-8 rounded-full border"
                        style={{ backgroundColor: strokeColor }}
                      />
                      <input 
                        id="stroke-color"
                        type="color"
                        value={strokeColor} 
                        onChange={(e) => setStrokeColor(e.target.value)}
                        className="h-9 w-full"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="stroke-width">Stroke Width</Label>
                    <span className="text-sm text-muted-foreground">{strokeWidth}px</span>
                  </div>
                  <Slider
                    id="stroke-width"
                    value={[strokeWidth]}
                    onValueChange={(values) => setStrokeWidth(values[0])}
                    min={0}
                    max={6}
                    step={0.5}
                  />
                </div>
                
                <Button onClick={generateMeme} className="w-full">
                  Generate Meme
                </Button>
              </div>
            )}
          </div>
          
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Preview</h2>
              <div className="border rounded-lg overflow-hidden p-2 flex items-center justify-center min-h-[300px]">
                <canvas ref={canvasRef} className="max-w-full max-h-[400px]" />
              </div>
              
              {imageUrl && (
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
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MemeGeneratorPage;
