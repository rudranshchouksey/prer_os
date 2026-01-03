import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
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
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  ExternalLink,
  MoreHorizontal,
  Trash2,
  Edit,
  Loader2,
  GripVertical,
  Sparkles,
  Copy,
  Check,
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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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
import { useEffect } from 'react';

// Application Card Component
function ApplicationCard({
  application,
  isDragging,
}: {
  application: JobApplication;
  isDragging?: boolean;
}) {
  const updateApplication = useUpdateJobApplication();
  const deleteApplication = useDeleteJobApplication();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const formatSalary = (min: number | null, max: number | null, currency: string | null) => {
    if (!min && !max) return null;
    const curr = currency || 'USD';
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
      maximumFractionDigits: 0,
    });
    if (min && max) return `${formatter.format(min)} - ${formatter.format(max)}`;
    if (min) return `${formatter.format(min)}+`;
    if (max) return `Up to ${formatter.format(max)}`;
    return null;
  };

  const handleDelete = () => {
    deleteApplication.mutate(application.id, {
      onSuccess: () => toast.success('Application deleted'),
    });
  };

  const salaryDisplay = formatSalary(
    application.salary_min,
    application.salary_max,
    application.salary_currency
  );

  return (
    <>
      <div
        className={cn(
          'soft-card p-4 cursor-grab active:cursor-grabbing',
          isDragging && 'opacity-50 shadow-lg'
        )}
      >
        <div className="flex items-start gap-3">
          {/* Company Logo Placeholder */}
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
            {application.company_logo ? (
              <img
                src={application.company_logo}
                alt={application.company_name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Building2 className="w-5 h-5 text-primary" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-medium text-foreground truncate">
                  {application.company_name}
                </h4>
                <p className="text-sm text-muted-foreground truncate">
                  {application.job_title}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  {application.job_url && (
                    <DropdownMenuItem onClick={() => window.open(application.job_url!, '_blank')}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Job
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              {application.location && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>{application.location}</span>
                </div>
              )}
              {salaryDisplay && (
                <div className="flex items-center gap-1 text-xs text-success">
                  <DollarSign className="w-3 h-3" />
                  <span>{salaryDisplay}</span>
                </div>
              )}
            </div>

            {application.notes && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {application.notes}
              </p>
            )}

            {application.job_type && (
              <Badge variant="secondary" className="mt-2 text-xs">
                {application.job_type}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <EditApplicationModal
        application={application}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />
    </>
  );
}

// Sortable Application Card
function SortableApplicationCard({ application }: { application: JobApplication }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: application.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ApplicationCard application={application} isDragging={isDragging} />
    </div>
  );
}

// Droppable Kanban Column
function KanbanColumn({
  status,
  applications,
}: {
  status: typeof APPLICATION_STATUSES[number];
  applications: JobApplication[];
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status.id}`,
    data: { status: status.id },
  });

  return (
    <div className="flex-shrink-0 w-72">
      <div 
        ref={setNodeRef}
        className={cn(
          'rounded-xl p-3 transition-colors min-h-[300px]',
          status.color,
          isOver && 'ring-2 ring-primary ring-offset-2'
        )}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-foreground">{status.label}</h3>
          <Badge variant="secondary" className="text-xs">
            {applications.length}
          </Badge>
        </div>
        <SortableContext
          items={applications.map(a => a.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3 min-h-[200px]">
            {applications.map((application) => (
              <SortableApplicationCard key={application.id} application={application} />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

// Add/Edit Application Modal
function AddApplicationModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const createApplication = useCreateJobApplication();
  const [formData, setFormData] = useState({
    company_name: '',
    job_title: '',
    location: '',
    job_url: '',
    salary_min: '',
    salary_max: '',
    salary_currency: 'USD',
    job_type: '',
    notes: '',
    status: 'wishlist' as ApplicationStatus,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createApplication.mutate(
      {
        company_name: formData.company_name,
        job_title: formData.job_title,
        location: formData.location || null,
        job_url: formData.job_url || null,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        salary_currency: formData.salary_currency,
        job_type: formData.job_type || null,
        notes: formData.notes || null,
        status: formData.status,
        company_logo: null,
        applied_at: formData.status !== 'wishlist' ? new Date().toISOString() : null,
        sort_order: 0,
      },
      {
        onSuccess: () => {
          toast.success('Application added!');
          onClose();
          setFormData({
            company_name: '',
            job_title: '',
            location: '',
            job_url: '',
            salary_min: '',
            salary_max: '',
            salary_currency: 'USD',
            job_type: '',
            notes: '',
            status: 'wishlist',
          });
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">Add Job Application</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Google"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                placeholder="Senior Engineer"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="San Francisco, CA"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v as ApplicationStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPLICATION_STATUSES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salaryMin">Salary Min</Label>
              <Input
                id="salaryMin"
                type="number"
                value={formData.salary_min}
                onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                placeholder="100000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salaryMax">Salary Max</Label>
              <Input
                id="salaryMax"
                type="number"
                value={formData.salary_max}
                onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                placeholder="150000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.salary_currency}
                onValueChange={(v) => setFormData({ ...formData, salary_currency: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="INR">INR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobUrl">Job URL</Label>
            <Input
              id="jobUrl"
              type="url"
              value={formData.job_url}
              onChange={(e) => setFormData({ ...formData, job_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Company research, interview prep notes..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createApplication.isPending}>
              {createApplication.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Application
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Edit Application Modal with Cover Letter Generator
function EditApplicationModal({
  application,
  isOpen,
  onClose,
}: {
  application: JobApplication;
  isOpen: boolean;
  onClose: () => void;
}) {
  const updateApplication = useUpdateJobApplication();
  const [formData, setFormData] = useState({
    company_name: application.company_name,
    job_title: application.job_title,
    location: application.location || '',
    job_url: application.job_url || '',
    salary_min: application.salary_min?.toString() || '',
    salary_max: application.salary_max?.toString() || '',
    salary_currency: application.salary_currency || 'USD',
    job_type: application.job_type || '',
    notes: application.notes || '',
    status: application.status,
  });

  // Cover letter state
  const [jobDescription, setJobDescription] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setFormData({
      company_name: application.company_name,
      job_title: application.job_title,
      location: application.location || '',
      job_url: application.job_url || '',
      salary_min: application.salary_min?.toString() || '',
      salary_max: application.salary_max?.toString() || '',
      salary_currency: application.salary_currency || 'USD',
      job_type: application.job_type || '',
      notes: application.notes || '',
      status: application.status,
    });
    setCoverLetter('');
    setJobDescription('');
  }, [application]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateApplication.mutate(
      {
        id: application.id,
        company_name: formData.company_name,
        job_title: formData.job_title,
        location: formData.location || null,
        job_url: formData.job_url || null,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        salary_currency: formData.salary_currency,
        job_type: formData.job_type || null,
        notes: formData.notes || null,
        status: formData.status,
      },
      {
        onSuccess: () => {
          toast.success('Application updated!');
          onClose();
        },
      }
    );
  };

  const handleGenerateCoverLetter = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please paste the job description first');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateCoverLetter({
        companyName: application.company_name,
        jobTitle: application.job_title,
        jobDescription,
      });
      setCoverLetter(result.coverLetter);
      toast.success('Cover letter generated!');
    } catch (error) {
      toast.error('Failed to generate cover letter');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCoverLetter = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif">Edit Application - {application.company_name}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="cover-letter" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Cover Letter
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-company">Company *</Label>
                  <Input
                    id="edit-company"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Job Title *</Label>
                  <Input
                    id="edit-title"
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v as ApplicationStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {APPLICATION_STATUSES.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateApplication.isPending}>
                  {updateApplication.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="cover-letter" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="job-description">Paste Job Description</Label>
              <Textarea
                id="job-description"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                rows={6}
                className="resize-none"
              />
            </div>

            <Button
              onClick={handleGenerateCoverLetter}
              disabled={isGenerating || !jobDescription.trim()}
              className="w-full gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Cover Letter
                </>
              )}
            </Button>

            {coverLetter && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Generated Cover Letter</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyCoverLetter}
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border border-border max-h-[300px] overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap font-sans text-foreground">
                    {coverLetter}
                  </pre>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Main Applications Page
export default function Applications() {
  const { data: applications, isLoading } = useJobApplications();
  const updateApplication = useUpdateJobApplication();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  // Handle URL action param
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setIsAddOpen(true);
    }
  }, [searchParams]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Group applications by status
  const applicationsByStatus = useMemo(() => {
    const grouped: Record<ApplicationStatus, JobApplication[]> = {
      wishlist: [],
      applied: [],
      hr_screen: [],
      technical: [],
      offer: [],
      rejection: [],
    };

    applications?.forEach((app) => {
      if (grouped[app.status]) {
        grouped[app.status].push(app);
      }
    });

    return grouped;
  }, [applications]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeApp = applications?.find((a) => a.id === active.id);
    if (!activeApp) return;

    // Check if dropped on a column
    const overId = over.id.toString();
    if (overId.startsWith('column-')) {
      const newStatus = overId.replace('column-', '') as ApplicationStatus;
      if (newStatus !== activeApp.status) {
        updateApplication.mutate({
          id: activeApp.id,
          status: newStatus,
        });
      }
      return;
    }

    // Dropped on another card - get that card's status
    const overApp = applications?.find((a) => a.id === over.id);
    if (overApp && overApp.status !== activeApp.status) {
      updateApplication.mutate({
        id: activeApp.id,
        status: overApp.status,
      });
    }
  };

  const activeApplication = activeId
    ? applications?.find((a) => a.id === activeId)
    : null;

  // Stats
  const totalApplications = applications?.length || 0;
  const appliedCount = applications?.filter((a) => a.status !== 'wishlist').length || 0;
  const offerCount = applications?.filter((a) => a.status === 'offer').length || 0;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-serif font-bold mb-2">
              <span className="gradient-text">Applications</span>
            </h1>
            <p className="text-muted-foreground">
              Track your job search pipeline
            </p>
          </div>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Application
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="soft-card p-4 text-center">
            <p className="text-2xl font-serif font-bold text-foreground">{totalApplications}</p>
            <p className="text-sm text-muted-foreground">Total Tracked</p>
          </div>
          <div className="soft-card p-4 text-center">
            <p className="text-2xl font-serif font-bold text-primary">{appliedCount}</p>
            <p className="text-sm text-muted-foreground">Applied</p>
          </div>
          <div className="soft-card p-4 text-center">
            <p className="text-2xl font-serif font-bold text-success">{offerCount}</p>
            <p className="text-sm text-muted-foreground">Offers</p>
          </div>
        </div>

        {/* Kanban Board */}
        <ScrollArea className="w-full">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 pb-4">
              {APPLICATION_STATUSES.map((status) => (
                <KanbanColumn
                  key={status.id}
                  status={status}
                  applications={applicationsByStatus[status.id]}
                />
              ))}
            </div>

            <DragOverlay>
              {activeApplication && (
                <ApplicationCard application={activeApplication} isDragging />
              )}
            </DragOverlay>
          </DndContext>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Empty State */}
        {totalApplications === 0 && (
          <div className="soft-card p-12 text-center">
            <Briefcase className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-serif font-semibold text-foreground mb-2">
              No applications yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Start tracking your job search journey
            </p>
            <Button onClick={() => setIsAddOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Application
            </Button>
          </div>
        )}
      </motion.div>

      <AddApplicationModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </MainLayout>
  );
}
