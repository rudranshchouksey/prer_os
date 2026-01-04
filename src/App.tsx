import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { CommandMenu } from "@/components/CommandMenu";

// Pages
import Landing from "./pages/Landing";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import StudyPlan from "./pages/StudyPlan";
import StudyNotes from "./pages/StudyNotes";
import InterviewReady from "./pages/InterviewReady"; // Now Personal Questions
import Practice from "./pages/Practice"; // New Global Questions
import Docs from "./pages/Docs";
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding";
import Applications from "./pages/Applications";
import NotFound from "./pages/NotFound";
import LegalPage from './pages/Legal';
import Changelog from './pages/Changelog';
import DocsLanding from './pages/DocsLanding';
import { About, Contact } from './pages/Company';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* Global Command Menu */}
          <CommandMenu />
          <Routes>
            <Route path="/" element={<Landing />} />
            
            {/* Legal Routes */}
            <Route path="/privacy" element={<LegalPage type="privacy" />} />
            <Route path="/terms" element={<LegalPage type="terms" />} />
            <Route path="/security" element={<LegalPage type="security" />} />
            
            {/* Company Routes */}
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Product Routes */}
            <Route path="/changelog" element={<Changelog />} />
            <Route path="/doc" element={<DocsLanding />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected App Routes */}
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/study-plan" element={<ProtectedRoute><StudyPlan /></ProtectedRoute>} />
            
            {/* Split Knowledge Base */}
            <Route path="/docs" element={<ProtectedRoute><Docs /></ProtectedRoute>} />
            <Route path="/notes" element={<ProtectedRoute><StudyNotes /></ProtectedRoute>} />
            
            {/* Split Practice */}
            <Route path="/questions" element={<ProtectedRoute><InterviewReady /></ProtectedRoute>} /> {/* Personal */}
            <Route path="/practice" element={<ProtectedRoute><Practice /></ProtectedRoute>} /> {/* Global */}
            
            <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;