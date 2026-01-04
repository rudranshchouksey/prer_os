import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  BookOpen, 
  MessageSquareText,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
  User,
  FileText,
  Briefcase,
  Search,
  Settings,
  MoreVertical,
  Zap,
  Menu 
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { CommandMenu } from '@/components/CommandMenu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,        // Added
  SheetTitle,         // Added
  SheetDescription    // Added
} from '@/components/ui/sheet';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/study-plan', label: 'Roadmap', icon: Calendar },
  { path: '/practice', label: 'Interview Question', icon: Zap },
  { path: '/questions', label: 'My Questions', icon: MessageSquareText },
  { path: '/applications', label: 'Applications', icon: Briefcase },
  { path: '/docs', label: 'Study Notes', icon: FileText },
  { path: '/notes', label: 'Notes', icon: BookOpen },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false); 
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  const NavContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo Area */}
      <div className={cn("h-20 flex items-center px-6", isMobile && "px-0")}>
        <div className="flex items-center gap-3 w-full">
          <div className="relative flex-shrink-0 cursor-pointer" onClick={() => { navigate('/dashboard'); if(isMobile) setMobileOpen(false); }}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <AnimatePresence>
            {(!collapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col overflow-hidden whitespace-nowrap"
              >
                <span className="font-serif font-bold text-xl text-slate-900 tracking-tight">PrepOS</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Interview OS</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Search */}
      <div className={cn("px-4 mb-6", isMobile && "px-0")}>
        <Button
          variant="outline"
          onClick={() => { setCommandOpen(true); if(isMobile) setMobileOpen(false); }}
          className={cn(
            "w-full h-10 bg-slate-50/50 hover:bg-slate-100 border-slate-200 text-slate-500 shadow-sm transition-all",
            (collapsed && !isMobile) ? "px-0 justify-center aspect-square" : "justify-between px-3"
          )}
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            {(!collapsed || isMobile) && <span className="text-sm font-medium">Search</span>}
          </div>
          {(!collapsed || isMobile) && (
            <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-400">
              ⌘K
            </kbd>
          )}
        </Button>
      </div>

      {/* Nav Links */}
      <div className={cn("flex-1 overflow-y-auto px-3 py-2 scrollbar-none", isMobile && "px-0")}>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path} onClick={() => isMobile && setMobileOpen(false)}>
                <div className={cn(
                    "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    isActive 
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/10" 
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                    (collapsed && !isMobile) && "justify-center px-0"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5 flex-shrink-0 transition-transform duration-200",
                    isActive ? "text-white" : "text-slate-500 group-hover:text-slate-900",
                    (!collapsed || isMobile) && "group-hover:scale-110"
                  )} />
                  {(!collapsed || isMobile) && <span className="font-medium text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>}
                  
                  {(collapsed && !isMobile) && (
                    <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / User */}
      <div className={cn("p-3 mt-auto border-t border-slate-100", isMobile && "px-0")}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-200 outline-none",
              "hover:bg-slate-100/80 active:scale-[0.98]",
              (collapsed && !isMobile) ? "justify-center" : "bg-white border border-slate-200 shadow-sm"
            )}>
              <Avatar className="w-8 h-8 rounded-lg border border-slate-100 bg-slate-50">
                <AvatarImage src="" />
                <AvatarFallback className="bg-indigo-50 text-indigo-600 font-bold rounded-lg text-xs">
                  {user?.email?.[0].toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {(!collapsed || isMobile) && (
                <>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{user?.email?.split('@')[0]}</p>
                    <p className="text-[10px] text-slate-500 truncate">Pro Account</p>
                  </div>
                  <MoreVertical className="w-4 h-4 text-slate-400" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side={isMobile ? "bottom" : "right"} className="w-56 mb-2 ml-2" sideOffset={10}>
            <DropdownMenuItem onClick={() => { navigate('/profile'); if(isMobile) setMobileOpen(false); }}><User className="w-4 h-4 mr-2" /> Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { navigate('/settings'); if(isMobile) setMobileOpen(false); }}><Settings className="w-4 h-4 mr-2" /> Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600"><LogOut className="w-4 h-4 mr-2" /> Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full mt-2 h-6 text-slate-400 hover:text-slate-600 hover:bg-transparent"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* 1. MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-serif font-bold text-lg text-slate-900">PrepOS</span>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6 text-slate-700" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] sm:w-[350px] p-6">
            
            {/* --- FIX IS HERE: Added Header for Accessibility --- */}
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
              <SheetDescription>Main application navigation links</SheetDescription>
            </SheetHeader>
            {/* ------------------------------------------------- */}

            <NavContent isMobile={true} />
          </SheetContent>
        </Sheet>
      </div>

      {/* 2. THE VISUAL SIDEBAR (Desktop) */}
      <motion.aside
        initial={false}
        animate={{ 
          width: collapsed ? 80 : 280,
          transition: { type: "spring", stiffness: 300, damping: 30 }
        }}
        className={cn(
          "fixed left-0 top-0 h-screen z-50 flex flex-col",
          "bg-white/80 backdrop-blur-xl border-r border-slate-200/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)]",
          "hidden md:flex" 
        )}
      >
        <NavContent isMobile={false} />
      </motion.aside>

      {/* 3. SPACER */}
      <motion.div 
        animate={{ 
          width: collapsed ? 80 : 280,
          transition: { type: "spring", stiffness: 300, damping: 30 }
        }}
        className="flex-shrink-0 hidden md:block relative z-0" 
      />
      
      {/* 4. MOBILE SPACER */}
      <div className="h-16 md:hidden w-full flex-shrink-0" />

      <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}