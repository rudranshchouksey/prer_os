import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background cyber-grid">
      <AppSidebar />
      <main className={cn(
        "min-h-screen transition-all duration-300",
        "ml-20 lg:ml-64",
        "p-6 lg:p-8"
      )}>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
