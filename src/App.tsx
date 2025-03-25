
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import TextGenerationPage from "./pages/TextGenerationPage";
import AuthPage from "./pages/AuthPage";
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
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/text-generation" element={<TextGenerationPage />} />
          <Route path="/auth" element={<AuthPage />} />
          
          {/* These routes would be implemented in a similar way */}
          <Route path="/image-generation" element={<TextGenerationPage />} />
          <Route path="/code-assistant" element={<TextGenerationPage />} />
          <Route path="/audio-transcription" element={<TextGenerationPage />} />
          <Route path="/settings" element={<AuthPage />} />
          
          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
