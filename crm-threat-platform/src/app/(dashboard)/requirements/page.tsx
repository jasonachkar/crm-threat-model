import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, AlertCircle, Clock } from 'lucide-react';

const requirementSections = [
  {
    section: 'Tenant Isolation',
    requirements: [
      {
        id: 'REQ-001',
        description: 'Implement row-level security (RLS) to enforce tenant_id filtering on all queries',
        status: 'not_implemented',
        priority: 'P0',
        threatRefs: ['TM-017', 'TM-012'],
      },
      {
        id: 'REQ-002',
        description: 'Add tenant_id validation middleware to all API endpoints',
        status: 'not_implemented',
        priority: 'P0',
        threatRefs: ['TM-017', 'TM-012'],
      },
      {
        id: 'REQ-003',
        description: 'Enforce tenant isolation in background jobs and async processes',
        status: 'not_implemented',
        priority: 'P1',
        threatRefs: ['TM-017'],
      },
    ],
  },
  {
    section: 'Authentication',
    requirements: [
      {
        id: 'REQ-004',
        description: 'Implement secure JWT storage (httpOnly cookies, not localStorage)',
        status: 'not_implemented',
        priority: 'P0',
        threatRefs: ['TM-001'],
      },
      {
        id: 'REQ-005',
        description: 'Add rate limiting on login endpoint (5 attempts per 15 minutes)',
        status: 'not_implemented',
        priority: 'P0',
        threatRefs: ['TM-002'],
      },
      {
        id: 'REQ-006',
        description: 'Implement multi-factor authentication (MFA) for admin accounts',
        status: 'not_implemented',
        priority: 'P1',
        threatRefs: ['TM-002', 'TM-003'],
      },
    ],
  },
  {
    section: 'Input Validation',
    requirements: [
      {
        id: 'REQ-007',
        description: 'Use parameterized queries for all database operations',
        status: 'not_implemented',
        priority: 'P0',
        threatRefs: ['TM-007'],
      },
      {
        id: 'REQ-008',
        description: 'Validate and sanitize all user inputs with Zod schemas',
        status: 'not_implemented',
        priority: 'P0',
        threatRefs: ['TM-007', 'TM-008'],
      },
      {
        id: 'REQ-009',
        description: 'Implement file upload validation (type, size, content inspection)',
        status: 'not_implemented',
        priority: 'P1',
        threatRefs: ['TM-009', 'TM-028'],
      },
    ],
  },
  {
    section: 'Audit Logging',
    requirements: [
      {
        id: 'REQ-010',
        description: 'Log all administrative actions with user, timestamp, and IP address',
        status: 'not_implemented',
        priority: 'P0',
        threatRefs: ['TM-013', 'TM-015'],
      },
      {
        id: 'REQ-011',
        description: 'Implement tamper-proof audit logs (append-only, write to separate storage)',
        status: 'not_implemented',
        priority: 'P1',
        threatRefs: ['TM-015'],
      },
      {
        id: 'REQ-012',
        description: 'Log all data access and modifications with before/after states',
        status: 'not_implemented',
        priority: 'P1',
        threatRefs: ['TM-016'],
      },
    ],
  },
  {
    section: 'Data Protection',
    requirements: [
      {
        id: 'REQ-013',
        description: 'Encrypt sensitive data at rest (PII, payment info, credentials)',
        status: 'not_implemented',
        priority: 'P0',
        threatRefs: ['TM-019', 'TM-026'],
      },
      {
        id: 'REQ-014',
        description: 'Remove sensitive data from error messages and logs',
        status: 'not_implemented',
        priority: 'P0',
        threatRefs: ['TM-020', 'TM-021'],
      },
      {
        id: 'REQ-015',
        description: 'Implement API response filtering to prevent excessive data exposure',
        status: 'not_implemented',
        priority: 'P1',
        threatRefs: ['TM-018', 'TM-025'],
      },
    ],
  },
];

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

export default function RequirementsPage() {
  const totalRequirements = requirementSections.reduce((acc, section) => acc + section.requirements.length, 0);
  const implementedCount = 0; // All are not_implemented for now
  const inProgressCount = 0;
  const notImplementedCount = totalRequirements;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Security Requirements</h2>
        <p className="text-muted-foreground">
          Checklist of {totalRequirements} security requirements mapped to threats
        </p>
      </div>

      {/* Summary Cards */}
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

      {/* Requirements by Section */}
      <div className="space-y-4">
        {requirementSections.map((section) => (
          <Card key={section.section}>
            <CardHeader>
              <CardTitle>{section.section}</CardTitle>
              <CardDescription>
                {section.requirements.length} requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {section.requirements.map((req) => (
                  <div key={req.id} className="flex items-start gap-4 p-4 rounded-lg border">
                    {getStatusIcon(req.status)}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium">{req.id}</span>
                        <Badge className={getPriorityColor(req.priority)}>{req.priority}</Badge>
                        <Badge variant="secondary" className={getStatusColor(req.status)}>
                          {req.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{req.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Related threats:</span>
                        {req.threatRefs.map((threatId) => (
                          <Badge key={threatId} variant="outline" className="text-xs">
                            {threatId}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
