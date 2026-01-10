'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Circle, AlertCircle, Clock, Filter, Plus, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createRequirement, updateRequirement, updateRequirementStatus } from '@/app/actions/requirements-actions';

export type RequirementRecord = {
  id: string;
  section: string;
  description: string;
  status: 'not_implemented' | 'in_progress' | 'implemented' | 'partial';
  priority: 'P0' | 'P1' | 'P2';
  threatRefs: string[];
  assignedTo?: string | null;
  testCases?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuditEntry = {
  id: string;
  action: string;
  entityId: string;
  createdAt: string;
  changes?: {
    before?: Record<string, unknown> | null;
    after?: Record<string, unknown> | null;
  } | null;
};

const statusOptions = ['not_implemented', 'in_progress', 'implemented', 'partial'] as const;
const priorityOptions = ['P0', 'P1', 'P2'] as const;

const formatStatus = (status: string) => status.replace('_', ' ');

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'implemented':
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case 'in_progress':
      return <Clock className="h-5 w-5 text-blue-600" />;
    case 'partial':
      return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    default:
      return <Circle className="h-5 w-5 text-gray-400" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'implemented':
      return 'bg-green-100 text-green-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'partial':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'P0':
      return 'bg-red-600';
    case 'P1':
      return 'bg-orange-500';
    case 'P2':
      return 'bg-blue-600';
    default:
      return 'bg-gray-500';
  }
};

const formatAuditLabel = (entry: AuditEntry) => {
  switch (entry.action) {
    case 'create_requirement':
      return 'Created requirement';
    case 'update_requirement_status':
      return 'Updated status';
    case 'update_requirement':
      return 'Updated requirement';
    default:
      return entry.action.replace(/_/g, ' ');
  }
};

type RequirementFormState = {
  id?: string;
  section: string;
  description: string;
  status: RequirementRecord['status'];
  priority: RequirementRecord['priority'];
  threatRefs: string;
  testCases: string;
  notes: string;
};

const emptyFormState: RequirementFormState = {
  section: '',
  description: '',
  status: 'not_implemented',
  priority: 'P1',
  threatRefs: '',
  testCases: '',
  notes: '',
};

export default function RequirementsManager({
  requirements,
  recentChanges,
}: {
  requirements: RequirementRecord[];
  recentChanges: AuditEntry[];
}) {
  const router = useRouter();
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formState, setFormState] = useState<RequirementFormState>(emptyFormState);
  const [isPending, startTransition] = useTransition();

  const filteredRequirements = useMemo(() => {
    return requirements.filter((req) => {
      const matchesPriority = priorityFilter === 'All' || req.priority === priorityFilter;
      const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
      return matchesPriority && matchesStatus;
    });
  }, [requirements, priorityFilter, statusFilter]);

  const requirementsBySection = useMemo(() => {
    return filteredRequirements.reduce<Record<string, RequirementRecord[]>>((acc, req) => {
      acc[req.section] = acc[req.section] ?? [];
      acc[req.section].push(req);
      return acc;
    }, {});
  }, [filteredRequirements]);

  const totalRequirements = filteredRequirements.length;
  const implementedCount = filteredRequirements.filter((req) => req.status === 'implemented').length;
  const inProgressCount = filteredRequirements.filter((req) => req.status === 'in_progress').length;
  const notImplementedCount = filteredRequirements.filter((req) => req.status === 'not_implemented').length;

  const openCreateDialog = () => {
    setFormState(emptyFormState);
    setDialogOpen(true);
  };

  const openEditDialog = (req: RequirementRecord) => {
    setFormState({
      id: req.id,
      section: req.section,
      description: req.description,
      status: req.status,
      priority: req.priority,
      threatRefs: req.threatRefs.join(', '),
      testCases: req.testCases ?? '',
      notes: req.notes ?? '',
    });
    setDialogOpen(true);
  };

  const handleFormChange = (field: keyof RequirementFormState, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      section: formState.section.trim(),
      description: formState.description.trim(),
      status: formState.status,
      priority: formState.priority,
      threatRefs: formState.threatRefs
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      testCases: formState.testCases.trim() || null,
      notes: formState.notes.trim() || null,
    };

    startTransition(async () => {
      if (formState.id) {
        await updateRequirement(formState.id, payload);
      } else {
        await createRequirement(payload);
      }
      setDialogOpen(false);
      router.refresh();
    });
  };

  const handleStatusChange = (requirementId: string, status: RequirementRecord['status']) => {
    startTransition(async () => {
      await updateRequirementStatus(requirementId, status);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Security Requirements</h2>
          <p className="text-muted-foreground">
            Checklist of {totalRequirements} security requirements mapped to threats
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Add requirement
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequirements}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Implemented</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{implementedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Not Implemented</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{notImplementedCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All priorities</SelectItem>
                    {priorityOptions.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All statuses</SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {formatStatus(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Showing {filteredRequirements.length} of {requirements.length} requirements</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {Object.entries(requirementsBySection).map(([section, sectionRequirements]) => (
              <Card key={section}>
                <CardHeader>
                  <CardTitle>{section}</CardTitle>
                  <CardDescription>{sectionRequirements.length} requirements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sectionRequirements.map((req) => (
                      <div key={req.id} className="flex flex-col gap-4 rounded-lg border p-4">
                        <div className="flex flex-wrap items-start gap-4">
                          {getStatusIcon(req.status)}
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-sm font-medium">{req.id.slice(0, 8)}</span>
                              <Badge className={getPriorityColor(req.priority)}>{req.priority}</Badge>
                              <Badge variant="secondary" className={getStatusColor(req.status)}>
                                {formatStatus(req.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{req.description}</p>
                            {req.threatRefs.length > 0 && (
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs text-muted-foreground">Related threats:</span>
                                {req.threatRefs.map((threatId) => (
                                  <Badge key={threatId} variant="outline" className="text-xs">
                                    {threatId}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <Label className="text-xs text-muted-foreground">Status</Label>
                            <Select
                              value={req.status}
                              onValueChange={(value) =>
                                handleStatusChange(req.id, value as RequirementRecord['status'])
                              }
                            >
                              <SelectTrigger className="h-8 w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {statusOptions.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {formatStatus(status)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => openEditDialog(req)}
                            >
                              <Pencil className="h-3 w-3" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {sectionRequirements.length === 0 && (
                      <p className="text-sm text-muted-foreground">No requirements match your filters.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredRequirements.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  No requirements match your current filters.
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Recent changes</CardTitle>
            <CardDescription>Latest governance updates recorded in the audit log</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentChanges.length === 0 && (
                <p className="text-sm text-muted-foreground">No recent activity recorded yet.</p>
              )}
              {recentChanges.map((entry) => (
                <div key={entry.id} className="space-y-1 rounded-md border p-3">
                  <div className="text-sm font-medium">{formatAuditLabel(entry)}</div>
                  <div className="text-xs text-muted-foreground">Requirement {entry.entityId}</div>
                  {entry.changes?.after?.status && (
                    <div className="text-xs text-muted-foreground">
                      Status: {String(entry.changes.after.status).replace('_', ' ')}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{formState.id ? 'Edit requirement' : 'Add requirement'}</DialogTitle>
            <DialogDescription>
              Capture governance requirements and keep the audit log updated.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="section">Section</Label>
                <Input
                  id="section"
                  value={formState.section}
                  onChange={(event) => handleFormChange('section', event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formState.priority}
                  onValueChange={(value) => handleFormChange('priority', value)}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formState.description}
                onChange={(event) => handleFormChange('description', event.target.value)}
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formState.status} onValueChange={(value) => handleFormChange('status', value)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {formatStatus(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="threatRefs">Threat refs</Label>
                <Input
                  id="threatRefs"
                  value={formState.threatRefs}
                  onChange={(event) => handleFormChange('threatRefs', event.target.value)}
                  placeholder="TM-001, TM-017"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="testCases">Test cases</Label>
              <Input
                id="testCases"
                value={formState.testCases}
                onChange={(event) => handleFormChange('testCases', event.target.value)}
                placeholder="QA verification steps"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={formState.notes}
                onChange={(event) => handleFormChange('notes', event.target.value)}
                placeholder="Implementation notes"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {formState.id ? 'Save changes' : 'Create requirement'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
