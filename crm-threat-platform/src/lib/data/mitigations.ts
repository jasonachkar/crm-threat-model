export interface MitigationSummary {
  id: string;
  code: string;
  title: string;
  priority: 'P0' | 'P1' | 'P2';
  status: 'planned' | 'in_progress' | 'completed';
  owner: string;
  effortEstimate: string;
  targetDate: string;
  threatRefs: string[];
}

export const mitigations: MitigationSummary[] = [
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
