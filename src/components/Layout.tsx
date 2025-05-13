
import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FileText, 
  ImageOff, 
  ZoomIn, 
  MessageSquare, 
  QrCode, 
  Menu, 
  X,
  ChevronLeft,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title,
  showBackButton = false
}) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const nativeAdContainerRef = useRef<HTMLDivElement>(null);
  const bannerAdContainerRef = useRef<HTMLDivElement>(null);

  const isHome = location.pathname === '/';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Effect to add Google AdSense script
  useEffect(() => {
    // Check if script already exists to prevent duplicates
    if (!document.querySelector('script[src*="adsbygoogle"]')) {
      const adsenseScript = document.createElement('script');
      adsenseScript.async = true;
      adsenseScript.crossOrigin = 'anonymous';
      adsenseScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7673358241410118';
      document.head.appendChild(adsenseScript);
      
      // Push an initial ad if needed
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});

      // Cleanup function to remove script when component unmounts
      return () => {
        if (document.head.contains(adsenseScript)) {
          document.head.removeChild(adsenseScript);
        }
      };
    }
  }, []);

  // Effect to initialize the AddThis banner ad
  useEffect(() => {
    if (!document.querySelector('script[data-banner-ad="true"]') && bannerAdContainerRef.current) {
      // Clear previous content
      while (bannerAdContainerRef.current.firstChild) {
        bannerAdContainerRef.current.removeChild(bannerAdContainerRef.current.firstChild);
      }
      
      // Create script element for options
      const optionsScript = document.createElement('script');
      optionsScript.type = 'text/javascript';
      optionsScript.setAttribute('data-banner-ad', 'true');
      optionsScript.text = `
        atOptions = {
          'key' : '6f36f44268be6594be2491cac9308ff0',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;
      bannerAdContainerRef.current.appendChild(optionsScript);

      // Create script element for invoke.js
      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.setAttribute('data-banner-ad', 'true');
      invokeScript.src = '//www.highperformanceformat.com/6f36f44268be6594be2491cac9308ff0/invoke.js';
      bannerAdContainerRef.current.appendChild(invokeScript);

      return () => {
        if (bannerAdContainerRef.current) {
          while (bannerAdContainerRef.current.firstChild) {
            bannerAdContainerRef.current.removeChild(bannerAdContainerRef.current.firstChild);
          }
        }
      };
    }
  }, [bannerAdContainerRef.current]);

  // Effect to initialize the native ad
  useEffect(() => {
    if (!document.querySelector('script[data-native-ad="true"]') && nativeAdContainerRef.current) {
      // Clear any existing content
      while (nativeAdContainerRef.current.firstChild) {
        nativeAdContainerRef.current.removeChild(nativeAdContainerRef.current.firstChild);
      }
      
      // Create the container div if it doesn't exist
      if (!document.getElementById('container-e09cd0a3172cf39543d01adb9ed3c6d4')) {
        const containerDiv = document.createElement('div');
        containerDiv.id = 'container-e09cd0a3172cf39543d01adb9ed3c6d4';
        nativeAdContainerRef.current.appendChild(containerDiv);
      }
      
      // Create script element for native ad
      const nativeAdScript = document.createElement('script');
      nativeAdScript.async = true;
      nativeAdScript.setAttribute('data-cfasync', 'false');
      nativeAdScript.setAttribute('data-native-ad', 'true');
      nativeAdScript.src = '//pl26624184.profitableratecpm.com/e09cd0a3172cf39543d01adb9ed3c6d4/invoke.js';
      nativeAdContainerRef.current.appendChild(nativeAdScript);

      return () => {
        if (nativeAdContainerRef.current) {
          while (nativeAdContainerRef.current.firstChild) {
            nativeAdContainerRef.current.removeChild(nativeAdContainerRef.current.firstChild);
          }
        }
      };
    }
  }, [nativeAdContainerRef.current]);

  const navigationLinks = [
    { 
      path: '/ocr', 
      name: 'OCR Tool', 
      icon: <FileText className="h-5 w-5 mr-2" /> 
    },
    { 
      path: '/background-remover', 
      name: 'Background Remover', 
      icon: <ImageOff className="h-5 w-5 mr-2" /> 
    },
    { 
      path: '/upscaler', 
      name: 'Image Upscaler', 
      icon: <ZoomIn className="h-5 w-5 mr-2" /> 
    },
    { 
      path: '/meme-generator', 
      name: 'Meme Generator', 
      icon: <MessageSquare className="h-5 w-5 mr-2" /> 
    },
    { 
      path: '/qr-code', 
      name: 'QR Code Generator', 
      icon: <QrCode className="h-5 w-5 mr-2" /> 
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex w-full justify-between items-center">
            <div className="flex items-center gap-2">
              {showBackButton && !isHome && (
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/">
                    <ChevronLeft className="h-5 w-5" />
                  </Link>
                </Button>
              )}
              <Link to="/" className="flex items-center gap-2">
                <span className="font-bold text-xl gradient-text">PixFlow</span>
              </Link>
            </div>
            
            {!isHome && title && (
              <h1 className="hidden md:block text-xl font-semibold">{title}</h1>
            )}
            
            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center gap-4">
              {navigationLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "flex items-center text-sm font-medium px-3 py-2 rounded-md transition-colors",
                    location.pathname === link.path 
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background pt-16 animate-fade-in md:hidden">
          <nav className="container py-8 flex flex-col gap-4">
            <Link
              to="/"
              className={cn(
                "flex items-center text-base font-medium px-4 py-3 rounded-md transition-colors",
                location.pathname === "/" 
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
              onClick={closeMenu}
            >
              <Home className="h-5 w-5 mr-2" />
              Home
            </Link>
            {navigationLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center text-base font-medium px-4 py-3 rounded-md transition-colors",
                  location.pathname === link.path 
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
                onClick={closeMenu}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
      
      {/* Main content */}
      <main className="flex-1 container py-6">
        {isHome ? (
          children
        ) : (
          <div className="max-w-5xl mx-auto">
            {title && <h1 className="text-2xl md:text-3xl font-bold mb-6 md:hidden">{title}</h1>}
            {children}
          </div>
        )}
      </main>
      
      {/* Google AdSense Ad */}
      <div className="w-full flex justify-center py-4 bg-background">
        <ins className="adsbygoogle"
             style={{ display: 'block', width: '100%', height: '90px' }}
             data-ad-client="ca-pub-7673358241410118"
             data-ad-slot="1234567890"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script>
          (adsbygoogle = window.adsbygoogle || []).push({});
        </script>
      </div>
      
      {/* Native Ad */}
      <div className="w-full flex justify-center py-4 bg-background">
        <div ref={nativeAdContainerRef} className="ad-container">
          <div id="container-e09cd0a3172cf39543d01adb9ed3c6d4"></div>
        </div>
      </div>
      
      {/* Banner Ad */}
      <div className="w-full flex justify-center py-4 bg-background">
        <div ref={bannerAdContainerRef} className="ad-container"></div>
      </div>
      
      {/* Footer */}
      <footer className="border-t py-6 bg-muted/40">
        <div className="container text-center text-muted-foreground text-sm">
          <p>© 2025 PixFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
