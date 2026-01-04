import { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
  defaultDropAnimationSideEffects, 
  DropAnimation
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  Building2,
  MapPin,
  DollarSign,
  ExternalLink,
  MoreHorizontal,
  Trash2,
  Edit,
  Loader2,
  Sparkles,
  Copy,
  Briefcase,
  Calendar,
  GripVertical,
  Link as LinkIcon,
  Columns,
  Layout,
  // Added missing imports here:
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useJobApplications,
  useCreateJobApplication,
  useUpdateJobApplication,
  useDeleteJobApplication,
  APPLICATION_STATUSES,
  JobApplication,
  ApplicationStatus,
} from '@/hooks/useJobApplications';
import { generateCoverLetter } from '@/services/ai';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';

// --- Scroll Hook for Mouse Wheel (Desktop) ---
function useHorizontalScroll() {
  const elRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = elRef.current;
    if (el) {
      const onWheel = (e: WheelEvent) => {
        if (e.deltaY === 0) return;
        // Only hijack vertical scroll if we are on a desktop-like view
        if (window.innerWidth >= 768) { 
            e.preventDefault();
            el.scrollBy({ left: e.deltaY, behavior: 'smooth' });
        }
      };
      el.addEventListener('wheel', onWheel);
      return () => el.removeEventListener('wheel', onWheel);
    }
  }, []);
  return elRef;
}

// --- Helper Components ---

const StatusIndicator = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    wishlist: 'bg-slate-400',
    applied: 'bg-blue-500',
    hr_screen: 'bg-purple-500',
    technical: 'bg-amber-500',
    offer: 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]',
    rejection: 'bg-red-500',
  };
  return <div className={cn("w-2.5 h-2.5 rounded-full ring-2 ring-white flex-shrink-0", colors[status] || 'bg-slate-500')} />;
};

// --- Main Application Card ---

function ApplicationCard({
  application,
  isDragging,
  isOverlay,
  isCompact
}: {
  application: JobApplication;
  isDragging?: boolean;
  isOverlay?: boolean;
  isCompact?: boolean;
}) {
  const deleteApplication = useDeleteJobApplication();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const formatSalary = (min: number | null, max: number | null, currency: string | null) => {
    if (!min && !max) return null;
    const curr = currency || 'USD';
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
      maximumFractionDigits: 0,
      notation: 'compact', 
    });
    if (min && max) return isCompact ? `${formatter.format(min)}+` : `${formatter.format(min)}-${formatter.format(max)}`;
    if (min) return `${formatter.format(min)}+`;
    return null;
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this application?')) {
      deleteApplication.mutate(application.id, { onSuccess: () => toast.success('Deleted successfully') });
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditOpen(true);
  };

  const handleViewJob = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (application.job_url) window.open(application.job_url, '_blank');
  };

  const salaryDisplay = formatSalary(application.salary_min, application.salary_max, application.salary_currency);

  return (
    <>
      <div
        className={cn(
          'relative rounded-xl border transition-all duration-200 select-none group bg-white border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)]',
          isCompact ? 'p-2.5' : 'p-3.5',
          isDragging && 'opacity-30 border-dashed border-slate-400 bg-slate-50',
          isOverlay && 'opacity-100 shadow-2xl ring-2 ring-purple-500 rotate-2 scale-105 z-50 cursor-grabbing bg-white/95 backdrop-blur-sm'
        )}
      >
        {!isCompact && (
          // Grip visible on Hover (Desktop) or Always (Mobile)
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-300 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1">
             <GripVertical className="w-4 h-4" />
          </div>
        )}

        <div className={cn("flex items-start gap-2.5", !isCompact && "pl-2")}>
          <div className={cn(
            "rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-400 shadow-inner",
            isCompact ? "w-8 h-8" : "w-10 h-10"
          )}>
            <Building2 className={isCompact ? "w-4 h-4" : "w-5 h-5"} />
          </div>

          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-start justify-between">
              <div className="min-w-0 pr-1">
                <div className="flex items-center gap-1.5">
                  <h4 className={cn("font-bold text-slate-900 truncate leading-tight", isCompact ? "text-xs max-w-[100px]" : "text-sm max-w-[140px]")}>
                    {application.company_name}
                  </h4>
                  {application.job_url && (
                    <button onClick={handleViewJob} className="text-slate-400 hover:text-purple-600 p-0.5 rounded-md hover:bg-purple-50" onPointerDown={(e) => e.stopPropagation()}>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <p className={cn("text-slate-500 truncate font-medium", isCompact ? "text-[10px]" : "text-xs mt-0.5")}>
                  {application.job_title}
                </p>
              </div>

              {!isCompact && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-2 text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleEdit}><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1 pt-1">
              {salaryDisplay && (
                <div className="flex items-center gap-0.5 text-[9px] font-semibold text-green-700 bg-green-50 px-1 py-0.5 rounded border border-green-100">
                  <DollarSign className="w-2.5 h-2.5" /> {salaryDisplay}
                </div>
              )}
              {!isCompact && application.location && (
                <div className="flex items-center gap-0.5 text-[9px] text-slate-600 bg-slate-100 px-1 py-0.5 rounded">
                  <MapPin className="w-2.5 h-2.5" /> {application.location}
                </div>
              )}
            </div>
          </div>
        </div>
        {isCompact && (
            <button className="absolute inset-0 z-0" onClick={handleEdit} aria-label="Edit" />
        )}
      </div>

      <EditApplicationModal
        application={application}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />
    </>
  );
}

function SortableApplicationCard({ application, isCompact }: { application: JobApplication, isCompact: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: application.id, data: { type: 'Application', application }
  });

  const style = { transform: CSS.Translate.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-manipulation mb-2.5">
      <ApplicationCard application={application} isDragging={isDragging} isCompact={isCompact} />
    </div>
  );
}

function KanbanColumn({
  status,
  applications,
  isCompact
}: {
  status: typeof APPLICATION_STATUSES[number];
  applications: JobApplication[];
  isCompact: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status.id}`,
    data: { status: status.id },
  });

  return (
    <div className={cn(
        "flex-shrink-0 h-full snap-center first:pl-0 transition-all duration-300",
        // MOBILE: Always 85vw to allow snap scrolling peek
        // DESKTOP: Flex-1 if compact, w-80 if normal
        isCompact ? "w-[85vw] md:w-auto md:flex-1 md:min-w-[180px]" : "w-[85vw] md:w-80"
    )}>
      <div 
        ref={setNodeRef}
        className={cn(
          'rounded-2xl h-full flex flex-col transition-colors border',
          'bg-slate-50/50 border-slate-200/50',
          isOver ? 'bg-purple-50/80 border-purple-200 ring-2 ring-purple-100' : ''
        )}
      >
        <div className={cn(
            "sticky top-0 z-10 flex items-center justify-between bg-slate-50/90 backdrop-blur-md border-b border-slate-200/50 rounded-t-2xl",
            isCompact ? "p-2" : "p-3"
        )}>
          <div className="flex items-center gap-2 overflow-hidden">
            <StatusIndicator status={status.id} />
            <h3 className={cn("font-bold text-slate-700 uppercase tracking-wide truncate", isCompact ? "text-xs" : "text-sm")}>
              {status.label}
            </h3>
          </div>
          <Badge variant="secondary" className="bg-white shadow-sm border border-slate-100 text-slate-600 font-mono text-[10px] h-5 min-w-[20px] justify-center px-1">
            {applications.length}
          </Badge>
        </div>

        <div className={cn("flex-1 overflow-y-auto scrollbar-hide", isCompact ? "px-1.5 py-2" : "px-2 py-3")}>
          <SortableContext
            items={applications.map(a => a.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="min-h-[150px]">
              {applications.map((application) => (
                <SortableApplicationCard key={application.id} application={application} isCompact={isCompact} />
              ))}
              {applications.length === 0 && (
                <div className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-200/60 rounded-xl text-slate-300">
                  <span className="text-[10px] font-medium">Empty</span>
                </div>
              )}
            </div>
          </SortableContext>
        </div>
      </div>
    </div>
  );
}

// --- Modals (Add / Edit) ---
function ApplicationFormModal({ 
  mode, 
  application, 
  isOpen, 
  onClose 
}: { 
  mode: 'create' | 'edit', 
  application?: JobApplication, 
  isOpen: boolean, 
  onClose: () => void 
}) {
  const createApplication = useCreateJobApplication();
  const updateApplication = useUpdateJobApplication();
  
  const [formData, setFormData] = useState({
    company_name: '',
    job_title: '',
    location: '',
    job_url: '',
    salary_min: '',
    salary_max: '',
    salary_currency: 'USD',
    job_type: 'Full-time',
    notes: '',
    status: 'wishlist' as ApplicationStatus,
    applied_at: new Date().toISOString().split('T')[0],
  });

  const [jobDescription, setJobDescription] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && application) {
      setFormData({
        company_name: application.company_name,
        job_title: application.job_title,
        location: application.location || '',
        job_url: application.job_url || '',
        salary_min: application.salary_min?.toString() || '',
        salary_max: application.salary_max?.toString() || '',
        salary_currency: application.salary_currency || 'USD',
        job_type: application.job_type || 'Full-time',
        notes: application.notes || '',
        status: application.status,
        applied_at: application.applied_at ? new Date(application.applied_at).toISOString().split('T')[0] : '',
      });
    } else if (mode === 'create') {
      setFormData({
        company_name: '', job_title: '', location: '', job_url: '',
        salary_min: '', salary_max: '', salary_currency: 'USD',
        job_type: 'Full-time', notes: '', status: 'wishlist',
        applied_at: new Date().toISOString().split('T')[0]
      });
    }
    setCoverLetter('');
  }, [mode, application, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
      salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
      applied_at: formData.applied_at ? new Date(formData.applied_at).toISOString() : null,
    };

    if (mode === 'create') {
      createApplication.mutate({ ...payload, company_logo: null, sort_order: 0 }, {
        onSuccess: () => { toast.success('Added successfully'); onClose(); }
      });
    } else if (application) {
      updateApplication.mutate({ id: application.id, ...payload }, {
        onSuccess: () => { toast.success('Updated successfully'); onClose(); }
      });
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!formData.company_name || !formData.job_title) return toast.error("Enter Company & Title first");
    if (!jobDescription) return toast.error("Paste Job Description");
    
    setIsGenerating(true);
    try {
      const res = await generateCoverLetter({ 
        companyName: formData.company_name, 
        jobTitle: formData.job_title, 
        jobDescription 
      });
      setCoverLetter(res.coverLetter);
      toast.success("Generated!");
    } catch { toast.error("Failed to generate"); }
    setIsGenerating(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[90dvh] overflow-y-auto rounded-2xl p-0 gap-0 border-0 shadow-2xl">
        <DialogHeader className="p-6 pb-4 bg-white border-b sticky top-0 z-10">
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            {mode === 'create' ? <Plus className="w-5 h-5 text-purple-600" /> : <Edit className="w-5 h-5 text-purple-600" />}
            {mode === 'create' ? 'New Application' : 'Edit Application'}
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="details" className="w-full">
          <div className="px-6 border-b border-slate-100 bg-slate-50/50">
            <TabsList className="grid w-full grid-cols-2 bg-transparent h-auto p-0">
              <TabsTrigger value="details" className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none py-3 bg-transparent font-medium">Details</TabsTrigger>
              <TabsTrigger value="cover-letter" className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none py-3 bg-transparent gap-2 font-medium"><Sparkles className="w-3.5 h-3.5 text-purple-600" /> AI Cover Letter</TabsTrigger>
            </TabsList>
          </div>
          <div className="p-6">
            <TabsContent value="details" className="mt-0">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Company</Label><Input value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} required className="h-10 bg-slate-50 border-slate-200" placeholder="e.g. Netflix" /></div>
                  <div className="space-y-1.5"><Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Job Title</Label><Input value={formData.job_title} onChange={e => setFormData({...formData, job_title: e.target.value})} required className="h-10 bg-slate-50 border-slate-200" placeholder="e.g. Senior Engineer" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="space-y-1.5"><Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Location</Label><div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Remote" className="pl-9 h-10 bg-slate-50 border-slate-200" /></div></div>
                   <div className="space-y-1.5"><Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Job URL</Label><div className="relative"><LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input value={formData.job_url} onChange={e => setFormData({...formData, job_url: e.target.value})} placeholder="https://..." className="pl-9 h-10 bg-slate-50 border-slate-200" /></div></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5"><Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Status</Label><Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as ApplicationStatus })}><SelectTrigger className="h-10 bg-slate-50 border-slate-200"><SelectValue /></SelectTrigger><SelectContent>{APPLICATION_STATUSES.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}</SelectContent></Select></div>
                   <div className="space-y-1.5"><Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Date Applied</Label><Input type="date" value={formData.applied_at} onChange={e => setFormData({...formData, applied_at: e.target.value})} className="h-10 bg-slate-50 border-slate-200" /></div>
                </div>
                <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 space-y-3">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2"><DollarSign className="w-3 h-3" /> Compensation</Label>
                    <div className="grid grid-cols-3 gap-3">
                        <Input type="number" placeholder="Min" value={formData.salary_min} onChange={e => setFormData({...formData, salary_min: e.target.value})} className="bg-white border-slate-200 h-9 text-sm" />
                        <Input type="number" placeholder="Max" value={formData.salary_max} onChange={e => setFormData({...formData, salary_max: e.target.value})} className="bg-white border-slate-200 h-9 text-sm" />
                        <Select value={formData.salary_currency} onValueChange={v => setFormData({...formData, salary_currency: v})}><SelectTrigger className="bg-white border-slate-200 h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem><SelectItem value="GBP">GBP</SelectItem><SelectItem value="INR">INR</SelectItem></SelectContent></Select>
                    </div>
                </div>
                <div className="space-y-1.5"><Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Notes</Label><Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={3} className="bg-slate-50 border-slate-200 resize-none" placeholder="Referrals, thoughts, interview codes..." /></div>
                <DialogFooter className="pt-2"><Button type="button" variant="outline" onClick={onClose} className="h-10">Cancel</Button><Button type="submit" disabled={createApplication.isPending || updateApplication.isPending} className="h-10 bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20">{(createApplication.isPending || updateApplication.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Application</Button></DialogFooter>
              </form>
            </TabsContent>
            <TabsContent value="cover-letter" className="mt-0 space-y-4">
                <div className="space-y-2"><Label className="text-xs font-bold text-slate-500 uppercase">Job Description</Label><Textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} rows={8} placeholder="Paste the full job description here..." className="font-mono text-xs bg-slate-50 border-slate-200 leading-relaxed" /></div>
                <Button onClick={handleGenerateCoverLetter} disabled={isGenerating} className="w-full h-10 bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 shadow-lg shadow-purple-500/20">{isGenerating ? <Loader2 className="animate-spin mr-2 w-4 h-4"/> : <Sparkles className="mr-2 w-4 h-4"/>} Generate Tailored Letter</Button>
                {coverLetter && (<div className="space-y-2 animate-in fade-in slide-in-from-bottom-2"><div className="flex items-center justify-between"><Label className="text-xs font-bold text-slate-500 uppercase">Generated Letter</Label><Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(coverLetter); toast.success("Copied!"); }}><Copy className="w-3 h-3 mr-1"/> Copy</Button></div><div className="p-4 bg-white rounded-lg border border-slate-200 text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto shadow-sm">{coverLetter}</div></div>)}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function AddApplicationModal(props: { isOpen: boolean, onClose: () => void }) {
    return <ApplicationFormModal mode="create" {...props} />;
}
function EditApplicationModal(props: { application: JobApplication, isOpen: boolean, onClose: () => void }) {
    return <ApplicationFormModal mode="edit" {...props} />;
}

// --- Main Page Component ---

export default function Applications() {
  const { data: applications, isLoading } = useJobApplications();
  const updateApplication = useUpdateJobApplication();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const scrollContainerRef = useHorizontalScroll();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (searchParams.get('action') === 'add') setIsAddOpen(true);
  }, [searchParams]);

  // Aggregate Stats
  const stats = useMemo(() => {
    if (!applications) return { total: 0, offers: 0, active: 0 };
    return {
        total: applications.length,
        offers: applications.filter(a => a.status === 'offer').length,
        active: applications.filter(a => ['applied', 'hr_screen', 'technical'].includes(a.status)).length
    };
  }, [applications]);

  const applicationsByStatus = useMemo(() => {
    const grouped: Record<ApplicationStatus, JobApplication[]> = {
      wishlist: [], applied: [], hr_screen: [], technical: [], offer: [], rejection: [],
    };
    applications?.forEach((app) => {
      if (grouped[app.status]) grouped[app.status].push(app);
    });
    return grouped;
  }, [applications]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    if (navigator.vibrate) navigator.vibrate(20); 
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeApp = applications?.find((a) => a.id === active.id);
    if (!activeApp) return;

    const overId = over.id.toString();
    
    if (overId.startsWith('column-')) {
      const newStatus = overId.replace('column-', '') as ApplicationStatus;
      if (newStatus !== activeApp.status) updateApplication.mutate({ id: activeApp.id, status: newStatus });
      return;
    }

    const overApp = applications?.find((a) => a.id === over.id);
    if (overApp && overApp.status !== activeApp.status) {
      updateApplication.mutate({ id: activeApp.id, status: overApp.status });
    }
  };

  const activeApplication = activeId ? applications?.find((a) => a.id === activeId) : null;

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }),
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
          <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-[calc(100dvh-6rem)] md:h-[calc(100dvh-4rem)] flex flex-col -m-4 md:-m-6">
        
        {/* Header */}
        <div className="flex flex-col gap-4 p-4 md:px-8 md:pt-6 bg-white border-b border-slate-100 sticky top-0 z-20 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-tight">Applications</h1>
              <p className="text-sm text-slate-500">Pipeline Management</p>
            </div>
            
            <div className="flex items-center gap-3">
                {/* Desktop View Toggle */}
                <div className="hidden md:flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button onClick={() => setIsCompact(false)} className={cn("p-1.5 rounded-md transition-all", !isCompact ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")} title="Comfortable View"><Layout className="w-4 h-4" /></button>
                    <button onClick={() => setIsCompact(true)} className={cn("p-1.5 rounded-md transition-all", isCompact ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")} title="Fit to Screen"><Columns className="w-4 h-4" /></button>
                </div>

                <div className="hidden md:flex gap-2 mx-2">
                    <Badge variant="outline" className="h-8 px-3 bg-slate-50 text-slate-600 gap-2 font-normal">
                        <Briefcase className="w-3.5 h-3.5" /> Total: <span className="font-bold text-slate-900">{stats.total}</span>
                    </Badge>
                    <Badge variant="outline" className="h-8 px-3 bg-blue-50 text-blue-700 border-blue-200 gap-2 font-normal">
                        <TrendingUp className="w-3.5 h-3.5" /> Active: <span className="font-bold">{stats.active}</span>
                    </Badge>
                    <Badge variant="outline" className="h-8 px-3 bg-green-50 text-green-700 border-green-200 gap-2 font-normal">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Offers: <span className="font-bold">{stats.offers}</span>
                    </Badge>
                </div>
                
                <Button onClick={() => setIsAddOpen(true)} className="bg-slate-900 text-white shadow-lg shadow-purple-900/20 hover:bg-slate-800 transition-all w-full md:w-auto h-10">
                    <Plus className="w-4 h-4 mr-2" /> New Application
                </Button>
            </div>
          </div>
          
          {/* Mobile Stats */}
          <div className="flex md:hidden justify-between gap-2 overflow-x-auto pb-1 scrollbar-hide">
             <div className="flex-1 bg-slate-50 p-2 rounded-lg border border-slate-100 text-center min-w-[80px]">
                <p className="text-[10px] text-slate-500 uppercase">Total</p>
                <p className="font-bold text-slate-900">{stats.total}</p>
             </div>
             <div className="flex-1 bg-blue-50 p-2 rounded-lg border border-blue-100 text-center min-w-[80px]">
                <p className="text-[10px] text-blue-600 uppercase">Active</p>
                <p className="font-bold text-blue-900">{stats.active}</p>
             </div>
             <div className="flex-1 bg-green-50 p-2 rounded-lg border border-green-100 text-center min-w-[80px]">
                <p className="text-[10px] text-green-600 uppercase">Offers</p>
                <p className="font-bold text-green-900">{stats.offers}</p>
             </div>
          </div>
        </div>

        {/* Board Canvas */}
        <div ref={scrollContainerRef} className="flex-1 overflow-x-auto overflow-y-hidden bg-slate-50/30">
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragStart={handleDragStart} 
            onDragEnd={handleDragEnd}
          >
            <div className={cn(
                "flex h-full p-4 md:p-6 gap-4 min-w-max md:min-w-0 snap-x snap-mandatory",
                !isCompact && "md:w-max" 
            )}>
              {APPLICATION_STATUSES.map((status) => (
                <KanbanColumn 
                  key={status.id} 
                  status={status} 
                  applications={applicationsByStatus[status.id]} 
                  isCompact={isCompact}
                />
              ))}
            </div>
            
            <DragOverlay dropAnimation={dropAnimation}>
              {activeApplication && <ApplicationCard application={activeApplication} isOverlay isCompact={isCompact} />}
            </DragOverlay>
          </DndContext>
        </div>
      </motion.div>

      <AddApplicationModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </MainLayout>
  );
}