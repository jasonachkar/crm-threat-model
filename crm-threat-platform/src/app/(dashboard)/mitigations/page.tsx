import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Calendar } from 'lucide-react';

const mitigations = [
  {
    id: 'MIT-001',
    code: 'P0-1',
    title: 'Implement Row-Level Security (RLS) for Tenant Isolation',
    priority: 'P0',
    status: 'planned',
    owner: 'Platform Team',
    effortEstimate: '2 weeks',
    targetDate: '2025-01-31',
    threatRefs: ['TM-017', 'TM-012'],
  },
  {
    id: 'MIT-002',
    code: 'P0-2',
    title: 'Migrate JWT Storage from localStorage to httpOnly Cookies',
    priority: 'P0',
    status: 'planned',
    owner: 'Application Team',
    effortEstimate: '1 week',
    targetDate: '2025-01-31',
    threatRefs: ['TM-001'],
  },
  {
    id: 'MIT-003',
    code: 'P0-3',
    title: 'Implement Rate Limiting on Authentication Endpoints',
    priority: 'P0',
    status: 'planned',
    owner: 'Platform Team',
    effortEstimate: '3 days',
    targetDate: '2025-01-31',
    threatRefs: ['TM-002', 'TM-027'],
  },
  {
    id: 'MIT-004',
    code: 'P0-4',
    title: 'Add Parameterized Queries Across All Database Operations',
    priority: 'P0',
    status: 'planned',
    owner: 'Application Team',
    effortEstimate: '2 weeks',
    targetDate: '2025-01-31',
    threatRefs: ['TM-007'],
  },
  {
    id: 'MIT-005',
    code: 'P0-5',
    title: 'Implement Comprehensive Audit Logging for Admin Actions',
    priority: 'P0',
    status: 'planned',
    owner: 'Platform Team',
    effortEstimate: '1 week',
    targetDate: '2025-01-31',
    threatRefs: ['TM-013', 'TM-015'],
  },
  {
    id: 'MIT-006',
    code: 'P1-1',
    title: 'Deploy Multi-Factor Authentication (MFA) for Admin Accounts',
    priority: 'P1',
    status: 'planned',
    owner: 'Application Team',
    effortEstimate: '2 weeks',
    targetDate: '2025-02-28',
    threatRefs: ['TM-002', 'TM-003'],
  },
  {
    id: 'MIT-007',
    code: 'P1-2',
    title: 'Implement File Upload Validation and Virus Scanning',
    priority: 'P1',
    status: 'planned',
    owner: 'Application Team',
    effortEstimate: '1 week',
    targetDate: '2025-02-28',
    threatRefs: ['TM-009', 'TM-028'],
  },
  {
    id: 'MIT-008',
    code: 'P1-3',
    title: 'Configure Object Storage Bucket Policies with Least Privilege',
    priority: 'P1',
    status: 'planned',
    owner: 'Platform Team',
    effortEstimate: '3 days',
    targetDate: '2025-02-28',
    threatRefs: ['TM-019'],
  },
  {
    id: 'MIT-009',
    code: 'P1-4',
    title: 'Remove Sensitive Data from Error Messages and Logs',
    priority: 'P1',
    status: 'planned',
    owner: 'Application Team',
    effortEstimate: '1 week',
    targetDate: '2025-02-28',
    threatRefs: ['TM-020', 'TM-021'],
  },
  {
    id: 'MIT-010',
    code: 'P1-5',
    title: 'Implement API Response Filtering to Prevent Data Overexposure',
    priority: 'P1',
    status: 'planned',
    owner: 'Application Team',
    effortEstimate: '1 week',
    targetDate: '2025-02-28',
    threatRefs: ['TM-018', 'TM-025'],
  },
];

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

export default function MitigationsPage() {
  const p0Count = mitigations.filter((m) => m.priority === 'P0').length;
  const p1Count = mitigations.filter((m) => m.priority === 'P1').length;
  const completedCount = mitigations.filter((m) => m.status === 'completed').length;
  const inProgressCount = mitigations.filter((m) => m.status === 'in_progress').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Mitigations Roadmap</h2>
        <p className="text-muted-foreground">
          Track implementation of {mitigations.length} security mitigations and countermeasures
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Mitigations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mitigations.length}</div>
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

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Mitigation Timeline</CardTitle>
          <CardDescription>Planned and in-progress security improvements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* P0 Mitigations */}
            <div>
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <Badge className="bg-red-600">P0</Badge>
                <span>Critical - Due January 2025</span>
              </h3>
              <div className="space-y-3">
                {mitigations
                  .filter((m) => m.priority === 'P0')
                  .map((mitigation) => (
                    <div key={mitigation.id} className="flex items-start gap-4 p-4 rounded-lg border">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-medium">{mitigation.code}</span>
                          <Badge variant="secondary" className={getStatusColor(mitigation.status)}>
                            {mitigation.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <h4 className="font-medium">{mitigation.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{mitigation.targetDate}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{mitigation.effortEstimate}</span>
                          </div>
                          <span>Owner: {mitigation.owner}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Mitigates:</span>
                          {mitigation.threatRefs.map((threatId) => (
                            <Badge key={threatId} variant="outline" className="text-xs">
                              {threatId}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* P1 Mitigations */}
            <div>
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <Badge className="bg-orange-500">P1</Badge>
                <span>High - Due February 2025</span>
              </h3>
              <div className="space-y-3">
                {mitigations
                  .filter((m) => m.priority === 'P1')
                  .map((mitigation) => (
                    <div key={mitigation.id} className="flex items-start gap-4 p-4 rounded-lg border">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-medium">{mitigation.code}</span>
                          <Badge variant="secondary" className={getStatusColor(mitigation.status)}>
                            {mitigation.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <h4 className="font-medium">{mitigation.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{mitigation.targetDate}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{mitigation.effortEstimate}</span>
                          </div>
                          <span>Owner: {mitigation.owner}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Mitigates:</span>
                          {mitigation.threatRefs.map((threatId) => (
                            <Badge key={threatId} variant="outline" className="text-xs">
                              {threatId}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
