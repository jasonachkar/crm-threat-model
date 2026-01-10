import { db } from '@/lib/db';
import { auditLog, threats, users } from '@/lib/db/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import DashboardCharts from '@/components/dashboard-charts';
import { and, eq, gte } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Fetch real statistics from database
  const allThreats = await db.select().from(threats);
  const adminUsers = await db.select().from(users).where(eq(users.role, 'admin'));

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const authEvents = await db
    .select()
    .from(auditLog)
    .where(and(eq(auditLog.entityType, 'auth'), gte(auditLog.createdAt, since)));

  const stats = {
    total: allThreats.length,
    highSeverity: allThreats.filter(t => t.severity === 'HIGH').length,
    p0Priority: allThreats.filter(t => t.priority === 'P0').length,
    mitigated: allThreats.filter(t => t.status === 'Mitigated' || t.status === 'Closed').length,
    open: allThreats.filter(t => t.status === 'Open').length,
    inProgress: allThreats.filter(t => t.status === 'In Progress').length,
  };

  const mfaEnabledAdmins = adminUsers.filter(user => user.mfaEnabled).length;
  const mfaCoverage = adminUsers.length > 0
    ? Math.round((mfaEnabledAdmins / adminUsers.length) * 100)
    : 0;

  const throttledAuthEvents = authEvents.filter(event => event.action === 'auth_login_throttled').length;
  const failedAuthEvents = authEvents.filter(event =>
    ['auth_login_failed', 'auth_mfa_failed', 'auth_mfa_missing', 'auth_login_invalid'].includes(event.action),
  ).length;

  // STRIDE breakdown
  const strideBreakdown = allThreats.reduce((acc, threat) => {
    const category = threat.strideCategory;
    if (!acc[category]) {
      acc[category] = { total: 0, high: 0, medium: 0, low: 0 };
    }
    acc[category].total++;
    if (threat.severity === 'HIGH') acc[category].high++;
    else if (threat.severity === 'MEDIUM') acc[category].medium++;
    else acc[category].low++;
    return acc;
  }, {} as Record<string, { total: number; high: number; medium: number; low: number }>);

  // Recent high priority threats
  const criticalThreats = allThreats
    .filter(t => (t.severity === 'HIGH' && t.status === 'Open') || t.priority === 'P0')
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Real-time overview of threat management system status
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Threats</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Across all STRIDE categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Severity</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.highSeverity}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">P0 Priority</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.p0Priority}</div>
            <p className="text-xs text-muted-foreground">
              Due within 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mitigated</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.mitigated}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.mitigated / stats.total) * 100) : 0}% completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <DashboardCharts threats={allThreats} />

      {/* Security Posture */}
      <Card>
        <CardHeader>
          <CardTitle>Security Posture</CardTitle>
          <CardDescription>Authentication resilience and MFA adoption</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="text-sm text-muted-foreground">Admin MFA Coverage</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold">{mfaCoverage}%</span>
              <Badge variant={mfaCoverage >= 80 ? 'default' : 'secondary'}>
                {mfaEnabledAdmins}/{adminUsers.length} admins enrolled
              </Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Encourage MFA enrollment for privileged accounts.
            </p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="text-sm text-muted-foreground">Login Throttling (last 24h)</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold">{throttledAuthEvents}</span>
              <Badge variant={throttledAuthEvents > 0 ? 'destructive' : 'secondary'}>
                {failedAuthEvents} failed attempts
              </Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Lockouts help reduce brute-force exposure.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Critical Threats Alert */}
      {criticalThreats.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="h-5 w-5" />
              Critical Threats Requiring Attention
            </CardTitle>
            <CardDescription className="text-red-700">
              {criticalThreats.length} high-priority threats need immediate action
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalThreats.map((threat) => (
                <Link
                  key={threat.id}
                  href={`/threats/${threat.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-white border hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-medium">{threat.id}</span>
                      <Badge className="bg-red-600">{threat.severity}</Badge>
                      <Badge className="bg-orange-600">{threat.priority}</Badge>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{threat.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{threat.affectedComponents}</p>
                  </div>
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    {threat.status}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* STRIDE Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Threats by STRIDE Category</CardTitle>
          <CardDescription>Distribution across security threat categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(strideBreakdown).map(([category, counts]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{category}</Badge>
                  <span className="text-sm text-muted-foreground">{counts.total} threats</span>
                </div>
                <div className="flex gap-1">
                  {counts.high > 0 && <Badge className="bg-red-600">{counts.high} High</Badge>}
                  {counts.medium > 0 && <Badge className="bg-orange-500">{counts.medium} Medium</Badge>}
                  {counts.low > 0 && <Badge className="bg-green-600">{counts.low} Low</Badge>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Threats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.open}</div>
            <p className="text-xs text-muted-foreground mt-1">Need assignment and planning</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently being addressed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.mitigated}</div>
            <p className="text-xs text-muted-foreground mt-1">Mitigated or closed</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
