
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  MessageSquare, 
  FileText, 
  Image, 
  Code, 
  Music, 
  Lock, 
  ChevronLeft, 
  ChevronRight, 
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface AppLink {
  name: string;
  path: string;
  icon: React.ReactNode;
}

export const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const location = useLocation();
  
  const apps: AppLink[] = [
    { name: 'Chat', path: '/chat', icon: <MessageSquare className="h-5 w-5" /> },
    { name: 'Text Generation', path: '/text-generation', icon: <FileText className="h-5 w-5" /> },
    { name: 'Image Generation', path: '/image-generation', icon: <Image className="h-5 w-5" /> },
    { name: 'Code Assistant', path: '/code-assistant', icon: <Code className="h-5 w-5" /> },
    { name: 'Audio Transcription', path: '/audio-transcription', icon: <Music className="h-5 w-5" /> }
  ];

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-full z-40 transition-all duration-300 ease-in-out",
        isOpen ? "w-64" : "w-0"
      )}
    >
      <div className="h-full neo-blur overflow-y-auto py-5 px-3 flex flex-col">
        <div className="flex items-center justify-between mb-8 px-2">
          <Link to="/" className="flex items-center">
            {isOpen && (
              <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                AI Craftworks
              </h1>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="hover:bg-accent rounded-full h-8 w-8"
          >
            {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        {isOpen && (
          <>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground px-2 py-1">
                Applications
              </p>
              {apps.map((app) => (
                <Link
                  key={app.path}
                  to={app.path}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                    location.pathname === app.path 
                      ? "bg-accent text-accent-foreground" 
                      : "text-foreground"
                  )}
                >
                  {app.icon}
                  <span>{app.name}</span>
                </Link>
              ))}
            </div>

            <div className="mt-auto">
              <Link
                to="/auth"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent"
              >
                <Lock className="h-5 w-5" />
                <span>Authentication</span>
              </Link>
              <Link
                to="/settings"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent"
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
            </div>
          </>
        )}
      </div>
      <div 
        className={cn(
          "fixed top-4 left-64 transition-all duration-300 ease-in-out",
          !isOpen && "left-0"
        )}
      >
        {!isOpen && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsOpen(true)}
            className="hover:bg-accent rounded-full h-8 w-8 shadow-md"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </aside>
  );
};
