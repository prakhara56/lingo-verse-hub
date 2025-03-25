
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main 
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out overflow-auto",
          sidebarOpen ? "ml-64" : "ml-0"
        )}
      >
        <div className="container py-6 mx-auto animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};
