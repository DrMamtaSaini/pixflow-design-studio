
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  ImageOff, 
  ZoomIn, 
  MessageSquare, 
  QrCode 
} from 'lucide-react';
import Layout from '@/components/Layout';

const HomePage = () => {
  const tools = [
    {
      icon: <FileText className="h-8 w-8 text-pixflow-purple" />,
      title: 'OCR Tool',
      description: 'Extract text from images with our OCR technology. Supports multiple languages.',
      path: '/ocr'
    },
    {
      icon: <ImageOff className="h-8 w-8 text-pixflow-purple" />,
      title: 'Background Remover',
      description: 'Remove backgrounds from your images with AI-powered technology.',
      path: '/background-remover'
    },
    {
      icon: <ZoomIn className="h-8 w-8 text-pixflow-purple" />,
      title: 'Image Upscaler',
      description: 'Enhance low-resolution images using AI upscaling technology.',
      path: '/upscaler'
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-pixflow-purple" />,
      title: 'Meme Generator',
      description: 'Create custom memes with various templates and text options.',
      path: '/meme-generator'
    },
    {
      icon: <QrCode className="h-8 w-8 text-pixflow-purple" />,
      title: 'QR Code Generator',
      description: 'Generate customizable QR codes for websites, text, and more.',
      path: '/qr-code'
    }
  ];

  return (
    <Layout>
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="gradient-text">PixFlow</span> Design Studio
        </h1>
        <p className="text-xl text-muted-foreground">
          A powerful suite of image and design tools to enhance your creative workflow
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {tools.map((tool, index) => (
          <Link 
            key={tool.path} 
            to={tool.path}
            className="tool-card"
            style={{ animationDelay: `${(index + 1) * 0.1}s` }}
          >
            <div className="tool-icon-container">
              {tool.icon}
            </div>
            <h2 className="text-xl font-semibold mb-2">{tool.title}</h2>
            <p className="text-muted-foreground text-center">{tool.description}</p>
          </Link>
        ))}
      </div>
      
      <div className="mt-16 p-6 bg-gradient-to-r from-pixflow-light-purple to-pixflow-light-blue rounded-xl text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <h2 className="text-2xl font-bold mb-2">Need custom design tools?</h2>
        <p className="text-muted-foreground mb-4">
          Our suite of tools is constantly evolving. Check back often for new features and improvements.
        </p>
      </div>
    </Layout>
  );
};

export default HomePage;
