import { db } from '@/lib/db';
import { threats } from '@/lib/db/schema';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Grid3X3, Activity } from 'lucide-react';
import ExecutiveDashboard from '@/components/executive-dashboard';
import DashboardCharts from '@/components/dashboard-charts';
import RiskHeatMap from '@/components/risk-heat-map';
import { ActivityFeedPlaceholder } from '@/components/activity-feed';
import ExportReport from '@/components/export-report';
import { auditLog, threats, users } from '@/lib/db/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import DashboardCharts from '@/components/dashboard-charts';
import { mitigations } from '@/lib/data/mitigations';
import { and, eq, gte } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Fetch all threats from database
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

  const severityWeight = {
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  const cloudAssetRiskMap = allThreats.reduce((acc, threat) => {
    if (!threat.cloudAssetType) {
      return acc;
    }
    if (!acc[threat.cloudAssetType]) {
      acc[threat.cloudAssetType] = { score: 0, threatIds: [] as string[] };
    }
    acc[threat.cloudAssetType].score += severityWeight[threat.severity] ?? 0;
    acc[threat.cloudAssetType].threatIds.push(threat.id);
    return acc;
  }, {} as Record<string, { score: number; threatIds: string[] }>);

  const topCloudAssets = Object.entries(cloudAssetRiskMap)
    .map(([assetType, details]) => ({
      assetType,
      score: details.score,
      threatIds: details.threatIds,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const mitigationImpact = mitigations
    .map((mitigation) => {
      const linkedThreats = allThreats.filter((threat) => mitigation.threatRefs.includes(threat.id));
      const score = linkedThreats.reduce(
        (total, threat) => total + (severityWeight[threat.severity] ?? 0),
        0,
      );
      return {
        ...mitigation,
        score,
        linkedThreats,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const renderThreatLinks = (threatIds: string[], fallbackHref: string) => {
    if (threatIds.length === 0) {
      return <span className="text-xs text-muted-foreground">No linked threats</span>;
    }
    const visible = threatIds.slice(0, 4);
    const remaining = threatIds.length - visible.length;
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {visible.map((id) => (
          <Link
            key={id}
            href={`/threats/${id}`}
            className="rounded-full border border-muted px-2 py-0.5 text-muted-foreground hover:text-foreground"
          >
            {id}
          </Link>
        ))}
        {remaining > 0 && (
          <Link
            href={fallbackHref}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            +{remaining} more
          </Link>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Security Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time threat intelligence and security posture overview
          </p>
        </div>
        <ExportReport threats={allThreats} />
      </div>

      <Tabs defaultValue="executive" className="space-y-6">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="executive" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Executive View
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="risk-map" className="gap-2">
            <Grid3X3 className="h-4 w-4" />
            Risk Heat Map
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="executive" className="space-y-6">
          <ExecutiveDashboard threats={allThreats} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <DashboardCharts threats={allThreats} />
        </TabsContent>

        <TabsContent value="risk-map" className="space-y-6">
          <RiskHeatMap threats={allThreats} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <ActivityFeedPlaceholder />
        </TabsContent>
      </Tabs>
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Threats</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link
              href="/threats"
              className="text-2xl font-bold text-blue-600 hover:text-blue-700"
            >
              {stats.total}
            </Link>
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
            <Link
              href="/threats?severity=HIGH"
              className="text-2xl font-bold text-red-600 hover:text-red-700"
            >
              {stats.highSeverity}
            </Link>
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
            <Link
              href="/threats?priority=P0"
              className="text-2xl font-bold text-orange-600 hover:text-orange-700"
            >
              {stats.p0Priority}
            </Link>
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
            <Link
              href="/threats?status=Mitigated"
              className="text-2xl font-bold text-green-600 hover:text-green-700"
            >
              {stats.mitigated}
            </Link>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.mitigated / stats.total) * 100) : 0}% completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <DashboardCharts threats={allThreats} />

      {/* Top 5 Risk Reductions */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Risk Reductions</CardTitle>
          <CardDescription>
            Highest-risk cloud assets and most impactful mitigations with direct traceability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">Top Cloud Assets at Risk</h3>
                <p className="text-xs text-muted-foreground">
                  Weighted by threat severity across cloud asset types
                </p>
              </div>
              {topCloudAssets.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Add cloud asset types to threats to populate this list.
                </p>
              ) : (
                <div className="space-y-3">
                  {topCloudAssets.map((asset) => (
                    <div key={asset.assetType} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/threats?query=${encodeURIComponent(asset.assetType)}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          {asset.assetType}
                        </Link>
                        <Badge variant="secondary">Risk score {asset.score}</Badge>
                      </div>
                      <div className="mt-2">
                        {renderThreatLinks(
                          asset.threatIds,
                          `/threats?query=${encodeURIComponent(asset.assetType)}`,
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">Most Effective Mitigations</h3>
                <p className="text-xs text-muted-foreground">
                  Ranked by severity-weighted threat coverage
                </p>
              </div>
              {mitigationImpact.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No mitigation coverage data available yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {mitigationImpact.map((mitigation) => (
                    <div key={mitigation.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/mitigations#${mitigation.id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          {mitigation.code}: {mitigation.title}
                        </Link>
                        <Badge variant="secondary">Coverage {mitigation.score}</Badge>
                      </div>
                      <div className="mt-2">
                        {renderThreatLinks(
                          mitigation.linkedThreats.map((threat) => threat.id),
                          '/threats',
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
                  <Link
                    href={`/threats?stride=${encodeURIComponent(category)}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    <Badge variant="outline">{category}</Badge>
                  </Link>
                  <Link
                    href={`/threats?stride=${encodeURIComponent(category)}`}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {counts.total} threats
                  </Link>
                </div>
                <div className="flex gap-1">
                  {counts.high > 0 && (
                    <Link
                      href={`/threats?stride=${encodeURIComponent(category)}&severity=HIGH`}
                      className="text-xs"
                    >
                      <Badge className="bg-red-600">{counts.high} High</Badge>
                    </Link>
                  )}
                  {counts.medium > 0 && (
                    <Link
                      href={`/threats?stride=${encodeURIComponent(category)}&severity=MEDIUM`}
                      className="text-xs"
                    >
                      <Badge className="bg-orange-500">{counts.medium} Medium</Badge>
                    </Link>
                  )}
                  {counts.low > 0 && (
                    <Link
                      href={`/threats?stride=${encodeURIComponent(category)}&severity=LOW`}
                      className="text-xs"
                    >
                      <Badge className="bg-green-600">{counts.low} Low</Badge>
                    </Link>
                  )}
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
            <Link
              href="/threats?status=Open"
              className="text-3xl font-bold text-red-600 hover:text-red-700"
            >
              {stats.open}
            </Link>
            <p className="text-xs text-muted-foreground mt-1">Need assignment and planning</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href="/threats?status=In%20Progress"
              className="text-3xl font-bold text-blue-600 hover:text-blue-700"
            >
              {stats.inProgress}
            </Link>
            <p className="text-xs text-muted-foreground mt-1">Currently being addressed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href="/threats?status=Mitigated"
              className="text-3xl font-bold text-green-600 hover:text-green-700"
            >
              {stats.mitigated}
            </Link>
            <p className="text-xs text-muted-foreground mt-1">Mitigated or closed</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
