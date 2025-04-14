
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "@/pages/HomePage";
import OCRPage from "@/pages/OCRPage";
import BackgroundRemoverPage from "@/pages/BackgroundRemoverPage";
import UpscalerPage from "@/pages/UpscalerPage";
import MemeGeneratorPage from "@/pages/MemeGeneratorPage";
import QRCodePage from "@/pages/QRCodePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ocr" element={<OCRPage />} />
          <Route path="/background-remover" element={<BackgroundRemoverPage />} />
          <Route path="/upscaler" element={<UpscalerPage />} />
          <Route path="/meme-generator" element={<MemeGeneratorPage />} />
          <Route path="/qr-code" element={<QRCodePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
