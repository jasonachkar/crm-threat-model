'use client';

import { Threat } from '@/lib/db/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
    } else {
      acc.push({ category: threat.strideCategory, count: 1 });
    }
    return acc;
  }, [] as { category: string; count: number }[]);

  // Severity distribution
  const severityData = [
    { name: 'HIGH', count: threats.filter(t => t.severity === 'HIGH').length },
    { name: 'MEDIUM', count: threats.filter(t => t.severity === 'MEDIUM').length },
    { name: 'LOW', count: threats.filter(t => t.severity === 'LOW').length },
  ].filter(item => item.count > 0);

  // Priority distribution
  const priorityData = [
    { name: 'P0', count: threats.filter(t => t.priority === 'P0').length },
    { name: 'P1', count: threats.filter(t => t.priority === 'P1').length },
    { name: 'P2', count: threats.filter(t => t.priority === 'P2').length },
  ].filter(item => item.count > 0);

  // Status distribution
  const statusData = [
    { name: 'Open', count: threats.filter(t => t.status === 'Open').length },
    { name: 'In Progress', count: threats.filter(t => t.status === 'In Progress').length },
    { name: 'Mitigated', count: threats.filter(t => t.status === 'Mitigated').length },
    { name: 'Closed', count: threats.filter(t => t.status === 'Closed').length },
    { name: 'Accepted Risk', count: threats.filter(t => t.status === 'Accepted Risk').length },
  ].filter(item => item.count > 0);

  return (
    <div className="grid gap-4 md:grid-cols-2">
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
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
                label={({ name, count }) => `${name}: ${count}`}
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
        </CardContent>
      </Card>
    </div>
  );
}
