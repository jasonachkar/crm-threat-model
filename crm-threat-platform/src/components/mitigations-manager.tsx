'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Filter, Pencil, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createMitigation, updateMitigation, updateMitigationStatus } from '@/app/actions/mitigation-actions';

export type MitigationRecord = {
  id: string;
  code: string;
  title: string;
  description: string;
  threatRefs: string[];
  priority: 'P0' | 'P1' | 'P2';
  effortEstimate?: string | null;
  owner: string;
  status: 'planned' | 'in_progress' | 'completed';
  targetDate?: string | null;
  completionDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MitigationAuditEntry = {
  id: string;
  action: string;
  entityId: string;
  createdAt: string;
  changes?: {
    before?: Record<string, unknown> | null;
    after?: Record<string, unknown> | null;
  } | null;
};

const statusOptions = ['planned', 'in_progress', 'completed'] as const;
const priorityOptions = ['P0', 'P1', 'P2'] as const;

const formatStatus = (status: string) => status.replace('_', ' ');

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
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

const formatAuditLabel = (entry: MitigationAuditEntry) => {
  switch (entry.action) {
    case 'create_mitigation':
      return 'Created mitigation';
    case 'update_mitigation_status':
      return 'Updated status';
    case 'update_mitigation':
      return 'Updated mitigation';
    default:
      return entry.action.replace(/_/g, ' ');
  }
};

type MitigationFormState = {
  id?: string;
  code: string;
  title: string;
  description: string;
  priority: MitigationRecord['priority'];
  status: MitigationRecord['status'];
  threatRefs: string;
  owner: string;
  effortEstimate: string;
  targetDate: string;
  notes: string;
};

const emptyFormState: MitigationFormState = {
  code: '',
  title: '',
  description: '',
  priority: 'P1',
  status: 'planned',
  threatRefs: '',
  owner: '',
  effortEstimate: '',
  targetDate: '',
  notes: '',
};

export default function MitigationsManager({
  mitigations,
  recentChanges,
}: {
  mitigations: MitigationRecord[];
  recentChanges: MitigationAuditEntry[];
}) {
  const router = useRouter();
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formState, setFormState] = useState<MitigationFormState>(emptyFormState);
  const [isPending, startTransition] = useTransition();

  const filteredMitigations = useMemo(() => {
    return mitigations.filter((mitigation) => {
      const matchesPriority = priorityFilter === 'All' || mitigation.priority === priorityFilter;
      const matchesStatus = statusFilter === 'All' || mitigation.status === statusFilter;
      return matchesPriority && matchesStatus;
    });
  }, [mitigations, priorityFilter, statusFilter]);

  const groupedMitigations = useMemo(() => {
    return filteredMitigations.reduce<Record<string, MitigationRecord[]>>((acc, mitigation) => {
      acc[mitigation.priority] = acc[mitigation.priority] ?? [];
      acc[mitigation.priority].push(mitigation);
      return acc;
    }, {});
  }, [filteredMitigations]);

  const p0Count = filteredMitigations.filter((m) => m.priority === 'P0').length;
  const p1Count = filteredMitigations.filter((m) => m.priority === 'P1').length;
  const completedCount = filteredMitigations.filter((m) => m.status === 'completed').length;
  const inProgressCount = filteredMitigations.filter((m) => m.status === 'in_progress').length;

  const openCreateDialog = () => {
    setFormState(emptyFormState);
    setDialogOpen(true);
  };

  const openEditDialog = (mitigation: MitigationRecord) => {
    setFormState({
      id: mitigation.id,
      code: mitigation.code,
      title: mitigation.title,
      description: mitigation.description,
      priority: mitigation.priority,
      status: mitigation.status,
      threatRefs: mitigation.threatRefs.join(', '),
      owner: mitigation.owner,
      effortEstimate: mitigation.effortEstimate ?? '',
      targetDate: mitigation.targetDate ? mitigation.targetDate.split('T')[0] : '',
      notes: mitigation.notes ?? '',
    });
    setDialogOpen(true);
  };

  const handleFormChange = (field: keyof MitigationFormState, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      code: formState.code.trim(),
      title: formState.title.trim(),
      description: formState.description.trim(),
      priority: formState.priority,
      status: formState.status,
      threatRefs: formState.threatRefs
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      owner: formState.owner.trim(),
      effortEstimate: formState.effortEstimate.trim() || null,
      targetDate: formState.targetDate ? new Date(formState.targetDate) : null,
      notes: formState.notes.trim() || null,
      completionDate: formState.status === 'completed' ? new Date() : null,
    };

    startTransition(async () => {
      if (formState.id) {
        await updateMitigation(formState.id, payload);
      } else {
        await createMitigation(payload);
      }
      setDialogOpen(false);
      router.refresh();
    });
  };

  const handleStatusChange = (mitigationId: string, status: MitigationRecord['status']) => {
    startTransition(async () => {
      await updateMitigationStatus(mitigationId, status);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mitigations Roadmap</h2>
          <p className="text-muted-foreground">
            Track implementation of {filteredMitigations.length} security mitigations and countermeasures
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Add mitigation
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Mitigations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredMitigations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">P0 Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{p0Count}</div>
            <p className="text-xs text-muted-foreground mt-1">Due within 30 days</p>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
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
                  <span>Showing {filteredMitigations.length} of {mitigations.length} mitigations</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mitigation Timeline</CardTitle>
              <CardDescription>Planned and in-progress security improvements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {(['P0', 'P1', 'P2'] as const).map((priority) => (
                  <div key={priority}>
                    <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                      <Badge className={getPriorityColor(priority)}>{priority}</Badge>
                      <span>Priority {priority}</span>
                    </h3>
                    <div className="space-y-3">
                      {(groupedMitigations[priority] ?? []).map((mitigation) => (
                        <div key={mitigation.id} className="flex flex-col gap-3 rounded-lg border p-4">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-medium">{mitigation.code}</span>
                                <Badge variant="secondary" className={getStatusColor(mitigation.status)}>
                                  {formatStatus(mitigation.status)}
                                </Badge>
                              </div>
                              <h4 className="font-medium">{mitigation.title}</h4>
                              <p className="text-sm text-muted-foreground">{mitigation.description}</p>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                {mitigation.targetDate && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{new Date(mitigation.targetDate).toLocaleDateString()}</span>
                                  </div>
                                )}
                                {mitigation.effortEstimate && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{mitigation.effortEstimate}</span>
                                  </div>
                                )}
                                <span>Owner: {mitigation.owner}</span>
                              </div>
                              {mitigation.threatRefs.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs text-muted-foreground">Mitigates:</span>
                                  {mitigation.threatRefs.map((threatId) => (
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
                                value={mitigation.status}
                                onValueChange={(value) =>
                                  handleStatusChange(mitigation.id, value as MitigationRecord['status'])
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
                                onClick={() => openEditDialog(mitigation)}
                              >
                                <Pencil className="h-3 w-3" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(groupedMitigations[priority] ?? []).length === 0 && (
                        <p className="text-sm text-muted-foreground">No mitigations in this priority.</p>
                      )}
                    </div>
                  </div>
                ))}
                {filteredMitigations.length === 0 && (
                  <p className="text-sm text-muted-foreground">No mitigations match your filters.</p>
                )}
              </div>
            </CardContent>
          </Card>
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
                  <div className="text-xs text-muted-foreground">Mitigation {entry.entityId}</div>
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
            <DialogTitle>{formState.id ? 'Edit mitigation' : 'Add mitigation'}</DialogTitle>
            <DialogDescription>Track governance milestones and keep the audit log updated.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={formState.code}
                  onChange={(event) => handleFormChange('code', event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner">Owner</Label>
                <Input
                  id="owner"
                  value={formState.owner}
                  onChange={(event) => handleFormChange('owner', event.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formState.title}
                onChange={(event) => handleFormChange('title', event.target.value)}
                required
              />
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
                <Label htmlFor="priority">Priority</Label>
                <Select value={formState.priority} onValueChange={(value) => handleFormChange('priority', value)}>
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
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="threatRefs">Threat refs</Label>
                <Input
                  id="threatRefs"
                  value={formState.threatRefs}
                  onChange={(event) => handleFormChange('threatRefs', event.target.value)}
                  placeholder="TM-001, TM-017"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="effortEstimate">Effort estimate</Label>
                <Input
                  id="effortEstimate"
                  value={formState.effortEstimate}
                  onChange={(event) => handleFormChange('effortEstimate', event.target.value)}
                  placeholder="2 weeks"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="targetDate">Target date</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={formState.targetDate}
                  onChange={(event) => handleFormChange('targetDate', event.target.value)}
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
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {formState.id ? 'Save changes' : 'Create mitigation'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
