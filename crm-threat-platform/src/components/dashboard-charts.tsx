'use client';

import { Threat } from '@/lib/db/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Link from 'next/link';

interface DashboardChartsProps {
  threats: Threat[];
}

const COLORS = {
  HIGH: '#dc2626',
  MEDIUM: '#f97316',
  LOW: '#16a34a',
  Spoofing: '#3b82f6',
  Tampering: '#8b5cf6',
  Repudiation: '#ec4899',
  'Information Disclosure': '#f59e0b',
  'Denial of Service': '#10b981',
  'Elevation of Privilege': '#ef4444',
};

export default function DashboardCharts({ threats }: DashboardChartsProps) {
  // STRIDE category distribution
  const strideData = threats.reduce((acc, threat) => {
    const existing = acc.find(item => item.category === threat.strideCategory);
    if (existing) {
      existing.count++;
      existing.threatIds.push(threat.id);
    } else {
      acc.push({ category: threat.strideCategory, count: 1, threatIds: [threat.id] });
    }
    return acc;
  }, [] as { category: string; count: number; threatIds: string[] }[]);

  // Severity distribution
  const severityData = [
    {
      name: 'HIGH',
      count: threats.filter(t => t.severity === 'HIGH').length,
      threatIds: threats.filter(t => t.severity === 'HIGH').map(t => t.id),
    },
    {
      name: 'MEDIUM',
      count: threats.filter(t => t.severity === 'MEDIUM').length,
      threatIds: threats.filter(t => t.severity === 'MEDIUM').map(t => t.id),
    },
    {
      name: 'LOW',
      count: threats.filter(t => t.severity === 'LOW').length,
      threatIds: threats.filter(t => t.severity === 'LOW').map(t => t.id),
    },
  ].filter(item => item.count > 0);

  // Priority distribution
  const priorityData = [
    {
      name: 'P0',
      count: threats.filter(t => t.priority === 'P0').length,
      threatIds: threats.filter(t => t.priority === 'P0').map(t => t.id),
    },
    {
      name: 'P1',
      count: threats.filter(t => t.priority === 'P1').length,
      threatIds: threats.filter(t => t.priority === 'P1').map(t => t.id),
    },
    {
      name: 'P2',
      count: threats.filter(t => t.priority === 'P2').length,
      threatIds: threats.filter(t => t.priority === 'P2').map(t => t.id),
    },
  ].filter(item => item.count > 0);

  // Status distribution
  const statusData = [
    {
      name: 'Open',
      count: threats.filter(t => t.status === 'Open').length,
      threatIds: threats.filter(t => t.status === 'Open').map(t => t.id),
    },
    {
      name: 'In Progress',
      count: threats.filter(t => t.status === 'In Progress').length,
      threatIds: threats.filter(t => t.status === 'In Progress').map(t => t.id),
    },
    {
      name: 'Mitigated',
      count: threats.filter(t => t.status === 'Mitigated').length,
      threatIds: threats.filter(t => t.status === 'Mitigated').map(t => t.id),
    },
    {
      name: 'Closed',
      count: threats.filter(t => t.status === 'Closed').length,
      threatIds: threats.filter(t => t.status === 'Closed').map(t => t.id),
    },
    {
      name: 'Accepted Risk',
      count: threats.filter(t => t.status === 'Accepted Risk').length,
      threatIds: threats.filter(t => t.status === 'Accepted Risk').map(t => t.id),
    },
  ].filter(item => item.count > 0);

  const severityWeight = {
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  const cloudControlCoverageMap = threats.reduce((acc, threat) => {
    threat.cloudControlMapping?.forEach((control) => {
      if (!acc[control]) {
        acc[control] = { count: 0, threatIds: [] as string[] };
      }
      acc[control].count += 1;
      acc[control].threatIds.push(threat.id);
    });
    return acc;
  }, {} as Record<string, { count: number; threatIds: string[] }>);

  const cloudControlCoverageData = Object.entries(cloudControlCoverageMap)
    .map(([control, details]) => ({
      control,
      count: details.count,
      threatIds: details.threatIds,
    }))
    .sort((a, b) => b.count - a.count);

  const misconfigurationRiskMap = threats.reduce((acc, threat) => {
    if (!threat.cloudAssetType) {
      return acc;
    }
    if (!acc[threat.cloudAssetType]) {
      acc[threat.cloudAssetType] = { riskScore: 0, threatIds: [] as string[] };
    }
    acc[threat.cloudAssetType].riskScore += severityWeight[threat.severity] ?? 0;
    acc[threat.cloudAssetType].threatIds.push(threat.id);
    return acc;
  }, {} as Record<string, { riskScore: number; threatIds: string[] }>);

  const misconfigurationRiskData = Object.entries(misconfigurationRiskMap)
    .map(([assetType, details]) => ({
      assetType,
      riskScore: details.riskScore,
      threatIds: details.threatIds,
    }))
    .sort((a, b) => b.riskScore - a.riskScore);

  const tenantExposureByProviderMap = threats.reduce((acc, threat) => {
    if (!threat.cloudProvider) {
      return acc;
    }
    const combined = `${threat.title} ${threat.affectedComponents} ${threat.asset}`.toLowerCase();
    if (!combined.includes('tenant')) {
      return acc;
    }
    if (!acc[threat.cloudProvider]) {
      acc[threat.cloudProvider] = { count: 0, threatIds: [] as string[] };
    }
    acc[threat.cloudProvider].count += 1;
    acc[threat.cloudProvider].threatIds.push(threat.id);
    return acc;
  }, {} as Record<string, { count: number; threatIds: string[] }>);

  const tenantExposureData = Object.entries(tenantExposureByProviderMap)
    .map(([provider, details]) => ({
      provider,
      count: details.count,
      threatIds: details.threatIds,
    }))
    .sort((a, b) => b.count - a.count);

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
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {/* STRIDE Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>STRIDE Category Distribution</CardTitle>
          <CardDescription>Threats by security category</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={strideData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="category"
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-3">
            {strideData.map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.category}</span>
                  <Link
                    href={`/threats?stride=${encodeURIComponent(item.category)}`}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    View {item.count}
                  </Link>
                </div>
                {renderThreatLinks(item.threatIds, `/threats?stride=${encodeURIComponent(item.category)}`)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Severity Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Severity Distribution</CardTitle>
          <CardDescription>Threats by risk severity</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-3">
            {severityData.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.name}</span>
                  <Link
                    href={`/threats?severity=${encodeURIComponent(item.name)}`}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    View {item.count}
                  </Link>
                </div>
                {renderThreatLinks(item.threatIds, `/threats?severity=${encodeURIComponent(item.name)}`)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Status Distribution</CardTitle>
          <CardDescription>Current threat statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-3">
            {statusData.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.name}</span>
                  <Link
                    href={`/threats?status=${encodeURIComponent(item.name)}`}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    View {item.count}
                  </Link>
                </div>
                {renderThreatLinks(item.threatIds, `/threats?status=${encodeURIComponent(item.name)}`)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Priority Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Priority Distribution</CardTitle>
          <CardDescription>Threats by priority level</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                <Cell fill="#dc2626" /> {/* P0 - Red */}
                <Cell fill="#f97316" /> {/* P1 - Orange */}
                <Cell fill="#3b82f6" /> {/* P2 - Blue */}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-3">
            {priorityData.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.name}</span>
                  <Link
                    href={`/threats?priority=${encodeURIComponent(item.name)}`}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    View {item.count}
                  </Link>
                </div>
                {renderThreatLinks(item.threatIds, `/threats?priority=${encodeURIComponent(item.name)}`)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cloud Control Coverage */}
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Cloud Control Coverage</CardTitle>
          <CardDescription>Threats mapped to cloud control families</CardDescription>
        </CardHeader>
        <CardContent>
          {cloudControlCoverageData.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add cloud control mappings to see coverage insights.
            </p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={cloudControlCoverageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="control" angle={-35} textAnchor="end" height={90} fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-3">
                {cloudControlCoverageData.map((item) => (
                  <div key={item.control} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.control}</span>
                      <Link
                        href={`/threats?query=${encodeURIComponent(item.control)}`}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        View {item.count}
                      </Link>
                    </div>
                    {renderThreatLinks(item.threatIds, `/threats?query=${encodeURIComponent(item.control)}`)}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Misconfiguration Risk */}
      <Card>
        <CardHeader>
          <CardTitle>Misconfiguration Risk</CardTitle>
          <CardDescription>Weighted risk by cloud asset type</CardDescription>
        </CardHeader>
        <CardContent>
          {misconfigurationRiskData.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Tag threats with cloud asset types to calculate risk scores.
            </p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={misconfigurationRiskData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="assetType" angle={-35} textAnchor="end" height={90} fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="riskScore" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-3">
                {misconfigurationRiskData.map((item) => (
                  <div key={item.assetType} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.assetType}</span>
                      <Link
                        href={`/threats?query=${encodeURIComponent(item.assetType)}`}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        View {item.threatIds.length}
                      </Link>
                    </div>
                    {renderThreatLinks(item.threatIds, `/threats?query=${encodeURIComponent(item.assetType)}`)}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Tenant Exposure by Provider */}
      <Card>
        <CardHeader>
          <CardTitle>Tenant Exposure by Provider</CardTitle>
          <CardDescription>Tenant-scoped threats by cloud provider</CardDescription>
        </CardHeader>
        <CardContent>
          {tenantExposureData.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Tenant-related threats will appear once cloud provider metadata is available.
            </p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tenantExposureData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="provider" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-3">
                {tenantExposureData.map((item) => (
                  <div key={item.provider} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.provider}</span>
                      <Link
                        href={`/threats?query=${encodeURIComponent(item.provider)}`}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        View {item.count}
                      </Link>
                    </div>
                    {renderThreatLinks(item.threatIds, `/threats?query=${encodeURIComponent(item.provider)}`)}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
