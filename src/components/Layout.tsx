
import React, { useEffect } from 'react';
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

  const isHome = location.pathname === '/';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Effect to initialize the AddThis banner ad
  useEffect(() => {
    // Create script element for options
    const optionsScript = document.createElement('script');
    optionsScript.type = 'text/javascript';
    optionsScript.text = `
      atOptions = {
        'key' : '6f36f44268be6594be2491cac9308ff0',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
    `;
    document.body.appendChild(optionsScript);

    // Create script element for invoke.js
    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = '//www.highperformanceformat.com/6f36f44268be6594be2491cac9308ff0/invoke.js';
    document.body.appendChild(invokeScript);

    // Cleanup function to remove scripts when component unmounts
    return () => {
      document.body.removeChild(optionsScript);
      if (document.body.contains(invokeScript)) {
        document.body.removeChild(invokeScript);
      }
    };
  }, []);

  // Effect to initialize the native ad
  useEffect(() => {
    // Create script element for native ad
    const nativeAdScript = document.createElement('script');
    nativeAdScript.async = true;
    nativeAdScript.setAttribute('data-cfasync', 'false');
    nativeAdScript.src = '//pl26624184.profitableratecpm.com/e09cd0a3172cf39543d01adb9ed3c6d4/invoke.js';
    document.body.appendChild(nativeAdScript);

    // Cleanup function to remove script when component unmounts
    return () => {
      if (document.body.contains(nativeAdScript)) {
        document.body.removeChild(nativeAdScript);
      }
    };
  }, []);

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
      
      {/* Native Ad */}
      <div className="w-full flex justify-center py-4 bg-background">
        <div id="container-e09cd0a3172cf39543d01adb9ed3c6d4"></div>
      </div>
      
      {/* Banner Ad */}
      <div id="adthis-banner" className="w-full flex justify-center py-4 bg-background">
        <div id="addthis-container"></div>
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
