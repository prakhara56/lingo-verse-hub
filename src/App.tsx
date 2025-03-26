
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import TextGenerationPage from "./pages/TextGenerationPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import StockAnalyzerPage from "./pages/StockAnalyzerPage";
import BlogGeneratorPage from "./pages/BlogGeneratorPage";
import CineNotesPage from "./pages/CineNotesPage";
import SettingsPage from "./pages/SettingsPage";
import AuthGuard from "./components/auth/AuthGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              
              <Route path="/" element={
                <AuthGuard>
                  <HomePage />
                </AuthGuard>
              } />
              
              <Route path="/chat" element={
                <AuthGuard>
                  <ChatPage />
                </AuthGuard>
              } />
              
              <Route path="/text-generation" element={
                <AuthGuard>
                  <TextGenerationPage />
                </AuthGuard>
              } />
              
              <Route path="/stock-analyzer" element={
                <AuthGuard>
                  <StockAnalyzerPage />
                </AuthGuard>
              } />
              
              <Route path="/blog-generator" element={
                <AuthGuard>
                  <BlogGeneratorPage />
                </AuthGuard>
              } />
              
              <Route path="/cine-notes" element={
                <AuthGuard>
                  <CineNotesPage />
                </AuthGuard>
              } />
              
              <Route path="/settings" element={
                <AuthGuard>
                  <SettingsPage />
                </AuthGuard>
              } />
              
              <Route path="/image-generation" element={
                <AuthGuard>
                  <ChatPage />
                </AuthGuard>
              } />
              
              <Route path="/code-assistant" element={
                <AuthGuard>
                  <ChatPage />
                </AuthGuard>
              } />
              
              <Route path="/audio-transcription" element={
                <AuthGuard>
                  <ChatPage />
                </AuthGuard>
              } />
              
              {/* Catch-all route for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
