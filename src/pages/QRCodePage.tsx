import React, { useState, useRef, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Download, Trash, Globe, AlignLeft, MessageSquare, Phone, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';

type ContentType = 'url' | 'text' | 'sms' | 'phone';

interface QRContent {
  type: ContentType;
  value: string;
  phone?: string;
  message?: string;
}

const QRCodePage = () => {
  const [qrContent, setQrContent] = useState<QRContent>({ type: 'url', value: 'https://' });
  const [foregroundColor, setForegroundColor] = useState<string>('#000000');
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  const [margin, setMargin] = useState<number>(20);
  const [size, setSize] = useState<number>(200);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [svgCode, setSvgCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (qrContent.type === 'url') {
      setQrContent({ ...qrContent, value: e.target.value });
    } else if (qrContent.type === 'text') {
      setQrContent({ ...qrContent, value: e.target.value });
    } else if (qrContent.type === 'sms') {
      setQrContent({ ...qrContent, message: e.target.value, value: `smsto:${qrContent.phone || ''}:${e.target.value}` });
    } else if (qrContent.type === 'phone') {
      setQrContent({ ...qrContent, value: `tel:${e.target.value}`, phone: e.target.value });
    }
  };
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value;
    if (qrContent.type === 'sms') {
      setQrContent({ 
        ...qrContent, 
        phone, 
        value: `smsto:${phone}:${qrContent.message || ''}` 
      });
    }
  };
  
  const handleContentTypeChange = (type: ContentType) => {
    // Reset values when changing type
    let newContent: QRContent = { type, value: '' };
    
    if (type === 'sms') {
      newContent = { 
        type, 
        value: 'smsto::',
        phone: '',
        message: ''
      };
    } else if (type === 'phone') {
      newContent = { 
        type, 
        value: 'tel:',
        phone: ''
      };
    } else if (type === 'url') {
      newContent = { 
        type, 
        value: 'https://'
      };
    }
    
    setQrContent(newContent);
    setQrDataUrl(null);
    setSvgCode(null);
  };
  
  const generateQRCode = async () => {
    let isEmpty = false;
    
    switch (qrContent.type) {
      case 'url':
        isEmpty = !qrContent.value || qrContent.value === 'https://';
        break;
      case 'text':
        isEmpty = !qrContent.value;
        break;
      case 'sms':
        isEmpty = !qrContent.phone || !qrContent.message;
        break;
      case 'phone':
        isEmpty = !qrContent.phone;
        break;
    }
    
    if (isEmpty) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Generate QR code as Data URL (PNG)
      const dataUrl = await QRCode.toDataURL(qrContent.value, {
        width: size,
        margin: margin / 100,
        color: {
          dark: foregroundColor,
          light: backgroundColor
        }
      });
      setQrDataUrl(dataUrl);
      
      // Also generate SVG version
      const svgString = await QRCode.toString(qrContent.value, {
        type: 'svg',
        width: size,
        margin: margin / 100,
        color: {
          dark: foregroundColor,
          light: backgroundColor
        }
      });
      setSvgCode(svgString);
      
      toast.success('QR code generated successfully!');
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleDownload = (format: 'png' | 'svg') => {
    if (format === 'png' && qrDataUrl) {
      const link = document.createElement('a');
      link.href = qrDataUrl;
      link.download = 'qrcode.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('QR code downloaded as PNG');
    } else if (format === 'svg' && svgCode) {
      const blob = new Blob([svgCode], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'qrcode.svg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('QR code downloaded as SVG');
    }
  };
  
  const handleReset = () => {
    setQrContent({ type: 'url', value: 'https://' });
    setForegroundColor('#000000');
    setBackgroundColor('#ffffff');
    setMargin(20);
    setSize(200);
    setQrDataUrl(null);
    setSvgCode(null);
    toast.info('Reset successful');
  };
  
  return (
    <Layout title="QR Code Generator" showBackButton>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6 animate-fade-in">
          <Card className="p-6">
            <Tabs defaultValue="url" onValueChange={(value) => handleContentTypeChange(value as ContentType)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="url">
                  <Globe className="h-4 w-4 mr-2 hidden sm:inline-block" />
                  URL
                </TabsTrigger>
                <TabsTrigger value="text">
                  <AlignLeft className="h-4 w-4 mr-2 hidden sm:inline-block" />
                  Text
                </TabsTrigger>
                <TabsTrigger value="sms">
                  <MessageSquare className="h-4 w-4 mr-2 hidden sm:inline-block" />
                  SMS
                </TabsTrigger>
                <TabsTrigger value="phone">
                  <Phone className="h-4 w-4 mr-2 hidden sm:inline-block" />
                  Phone
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="url" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="url-input">Website URL</Label>
                  <Input
                    id="url-input"
                    value={qrContent.value}
                    onChange={handleTextChange}
                    placeholder="https://example.com"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="text" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="text-input">Text Content</Label>
                  <Input
                    id="text-input"
                    value={qrContent.value}
                    onChange={handleTextChange}
                    placeholder="Enter your text here"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="sms" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="phone-input">Phone Number</Label>
                  <Input
                    id="phone-input"
                    value={qrContent.phone || ''}
                    onChange={handlePhoneChange}
                    placeholder="+1234567890"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message-input">Message</Label>
                  <Input
                    id="message-input"
                    value={qrContent.message || ''}
                    onChange={handleTextChange}
                    placeholder="Enter your message here"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="phone" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="phone-number-input">Phone Number</Label>
                  <Input
                    id="phone-number-input"
                    value={qrContent.phone || ''}
                    onChange={handleTextChange}
                    placeholder="+1234567890"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </Card>
          
          <Card className="p-6 space-y-6">
            <h3 className="text-lg font-semibold">Customization</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="foreground-color">Foreground Color</Label>
                <div className="flex items-center gap-3">
                  <div 
                    className="h-8 w-8 rounded-full border"
                    style={{ backgroundColor: foregroundColor }}
                  />
                  <input 
                    id="foreground-color"
                    type="color"
                    value={foregroundColor} 
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="h-9 w-full"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="background-color">Background Color</Label>
                <div className="flex items-center gap-3">
                  <div 
                    className="h-8 w-8 rounded-full border"
                    style={{ backgroundColor: backgroundColor }}
                  />
                  <input 
                    id="background-color"
                    type="color"
                    value={backgroundColor} 
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="h-9 w-full"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="margin-slider">Margin</Label>
                  <span className="text-sm text-muted-foreground">{margin}px</span>
                </div>
                <Slider
                  id="margin-slider"
                  value={[margin]}
                  onValueChange={(values) => setMargin(values[0])}
                  min={0}
                  max={50}
                  step={5}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="size-slider">Size</Label>
                  <span className="text-sm text-muted-foreground">{size}px</span>
                </div>
                <Slider
                  id="size-slider"
                  value={[size]}
                  onValueChange={(values) => setSize(values[0])}
                  min={100}
                  max={400}
                  step={10}
                />
              </div>
            </div>
          </Card>
          
          <Button 
            onClick={generateQRCode} 
            className="w-full"
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : (
              <>
                <QrCode className="h-4 w-4 mr-2" />
                Generate QR Code
              </>
            )}
          </Button>
        </div>
        
        <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Preview</h2>
            <div 
              className="border rounded-lg flex items-center justify-center p-8"
              style={{ 
                backgroundColor: backgroundColor,
                minHeight: '300px'
              }}
            >
              {qrDataUrl ? (
                <img 
                  src={qrDataUrl} 
                  alt="Generated QR Code"
                  style={{ 
                    maxWidth: '100%',
                    maxHeight: '300px'
                  }}
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <QrCode size={64} className="mx-auto mb-4 opacity-20" />
                  <p>Your QR code will appear here</p>
                </div>
              )}
            </div>
            
            {qrDataUrl && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={() => handleDownload('png')} 
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PNG
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => handleDownload('svg')} 
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download SVG
                  </Button>
                </div>
                
                <Button 
                  variant="outline"
                  onClick={handleReset} 
                  className="w-full"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <canvas ref={qrCanvasRef} style={{ display: 'none' }} />
    </Layout>
  );
};

export default QRCodePage;
