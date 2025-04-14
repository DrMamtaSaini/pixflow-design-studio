
import React from 'react';
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
