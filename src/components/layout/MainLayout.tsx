import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
}

export function MainLayout({ children, className }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-[#f8f9fa] relative text-slate-900 font-sans">
      
      {/* Subtle Background Texture */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px]" />

      {/* Sidebar (Includes the hidden spacer for desktop layout) */}
      <AppSidebar />
      
      {/* Main Content Area */}
      <main 
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out relative z-10",
          className
        )}
      >
        {/* Inner Container:
           1. Handles responsive padding (tight on mobile, spacious on desktop)
           2. Centers content on ultra-wide screens
           3. Ensures full height for flex children
        */}
        <div className="flex-1 w-full h-full p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}