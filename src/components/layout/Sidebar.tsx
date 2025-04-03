
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
  Settings,
  Sun,
  Moon,
  LogOut,
  BarChart,
  FileEdit,
  Youtube,
  User,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface AppLink {
  name: string;
  path: string;
  icon: React.ReactNode;
  category?: string;
  description?: string;
}

export const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut, userProfile } = useAuth();
  
  const apps: AppLink[] = [
    { name: 'Home', path: '/', icon: <MessageSquare className="h-5 w-5" />, category: 'main', description: 'Dashboard' },
    { name: 'AI Chat Hub', path: '/chat', icon: <MessageSquare className="h-5 w-5" />, category: 'main', description: 'Chat with AI assistant' },
    { name: 'Stock Analyzer', path: '/stock-analyzer', icon: <BarChart className="h-5 w-5" />, category: 'main', description: 'Analyze stock data' },
    { name: 'Blog Generator', path: '/blog-generator', icon: <FileEdit className="h-5 w-5" />, category: 'main', description: 'Generate blog content' },
    { name: 'CineNotes', path: '/cine-notes', icon: <Youtube className="h-5 w-5" />, category: 'main', description: 'Video notes and analysis' },
    { name: 'Settings', path: '/settings', icon: <Settings className="h-5 w-5" />, category: 'extra', description: 'Configure app settings' }
  ];

  const getInitials = (username: string | null): string => {
    if (!username) return "AI";
    return username.substring(0, 2).toUpperCase();
  };

  const getDisplayName = (): string => {
    if (userProfile?.name) return userProfile.name;
    if (userProfile?.username) return userProfile.username;
    return "User";
  };

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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(!isOpen)}
                  className="hover:bg-accent rounded-full h-8 w-8"
                >
                  {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {isOpen && (
          <>
            {user && (
              <div className="mb-6 px-2">
                <div className="flex items-center space-x-3 p-2 rounded-lg bg-accent/30">
                  <Avatar>
                    <AvatarImage src={userProfile?.avatar_url ?? ""} />
                    <AvatarFallback>{getInitials(userProfile?.username)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {getDisplayName()}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {userProfile?.username || 'Set username'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground px-2 py-1">
                Applications
              </p>
              {apps.filter(app => app.category === 'main').map((app) => (
                <TooltipProvider key={app.path}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
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
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{app.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>

            <div className="mt-auto space-y-1">
              <div className="pt-4">
                <p className="text-xs font-medium text-muted-foreground px-2 py-1">
                  Preferences
                </p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full flex items-center justify-between px-3 py-2 text-sm"
                        onClick={toggleTheme}
                      >
                        <div className="flex items-center gap-3">
                          {theme === 'dark' ? (
                            <Moon className="h-5 w-5" />
                          ) : (
                            <Sun className="h-5 w-5" />
                          )}
                          <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Toggle between light and dark mode</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {user ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full flex items-center justify-between px-3 py-2 text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={signOut}
                      >
                        <div className="flex items-center gap-3">
                          <LogOut className="h-5 w-5" />
                          <span>Sign Out</span>
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Sign out of your account</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to="/auth"
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                          location.pathname === '/auth' 
                            ? "bg-accent text-accent-foreground" 
                            : "text-foreground"
                        )}
                      >
                        <Lock className="h-5 w-5" />
                        <span>Sign In</span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Sign in or create an account</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {apps.filter(app => app.category === 'extra').map((app) => (
                <TooltipProvider key={app.path}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
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
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{app.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsOpen(true)}
                  className="hover:bg-accent rounded-full h-8 w-8 shadow-md"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Expand sidebar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </aside>
  );
};
