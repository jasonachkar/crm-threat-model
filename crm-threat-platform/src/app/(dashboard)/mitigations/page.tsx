import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Calendar } from 'lucide-react';
import { mitigations } from '@/lib/data/mitigations';

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
                    <div
                      key={mitigation.id}
                      id={mitigation.id}
                      className="flex items-start gap-4 p-4 rounded-lg border"
                    >
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
                    <div
                      key={mitigation.id}
                      id={mitigation.id}
                      className="flex items-start gap-4 p-4 rounded-lg border"
                    >
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
import { db } from '@/lib/db';
import { auditLog, mitigations } from '@/lib/db/schema';
import { asc, desc, eq } from 'drizzle-orm';
import MitigationsManager from '@/components/mitigations-manager';

export default async function MitigationsPage() {
  const mitigationRows = await db
    .select()
    .from(mitigations)
    .orderBy(asc(mitigations.priority), asc(mitigations.createdAt));

  const recentChanges = await db
    .select()
    .from(auditLog)
    .where(eq(auditLog.entityType, 'mitigation'))
    .orderBy(desc(auditLog.createdAt))
    .limit(6);

  const mitigationsData = mitigationRows.map((mitigation) => ({
    ...mitigation,
    threatRefs: mitigation.threatRefs ?? [],
    targetDate: mitigation.targetDate ? mitigation.targetDate.toISOString() : null,
    completionDate: mitigation.completionDate ? mitigation.completionDate.toISOString() : null,
    createdAt: mitigation.createdAt.toISOString(),
    updatedAt: mitigation.updatedAt.toISOString(),
  }));

  const recentChangesData = recentChanges.map((entry) => ({
    id: entry.id,
    action: entry.action,
    entityId: entry.entityId,
    createdAt: entry.createdAt.toISOString(),
    changes: entry.changes,
  }));

  return <MitigationsManager mitigations={mitigationsData} recentChanges={recentChangesData} />;
}
