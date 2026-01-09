'use client';

import { Threat } from '@/lib/db/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateRiskScore } from '@/lib/risk-scoring';
import { getComponentDistribution, getOwnerDistribution } from '@/lib/security-metrics';
import { 
  Treemap, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Cell, PieChart, Pie, Legend 
} from 'recharts';
import { Server, Users, AlertTriangle, Shield, Layers } from 'lucide-react';
import Link from 'next/link';

interface AttackSurfaceProps {
  threats: Threat[];
}

// Color palette for components
const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#6366f1', '#f43f5e', '#14b8a6'];

export default function AttackSurface({ threats }: AttackSurfaceProps) {
  const componentDist = getComponentDistribution(threats);
  const ownerDist = getOwnerDistribution(threats);
  
  // Calculate component risk scores
  const componentRisk: Record<string, { threats: number; totalRisk: number; avgRisk: number; critical: number }> = {};
  
  threats.forEach(threat => {
    const components = threat.affectedComponents.split('|').map(c => c.trim());
    const score = calculateRiskScore(threat);
    
    components.forEach(component => {
      if (!component) return;
      if (!componentRisk[component]) {
        componentRisk[component] = { threats: 0, totalRisk: 0, avgRisk: 0, critical: 0 };
      }
      componentRisk[component].threats++;
      componentRisk[component].totalRisk += score.overall;
      if (score.riskLevel === 'Critical' || score.riskLevel === 'High') {
        componentRisk[component].critical++;
      }
    });
  });
  
  // Calculate averages
  Object.keys(componentRisk).forEach(key => {
    componentRisk[key].avgRisk = Math.round(
      (componentRisk[key].totalRisk / componentRisk[key].threats) * 10
    ) / 10;
  });
  
  // Sort by risk for ranking
  const rankedComponents = Object.entries(componentRisk)
    .sort((a, b) => b[1].totalRisk - a[1].totalRisk)
    .slice(0, 10);
  
  // Treemap data
  const treemapData = rankedComponents.map(([name, data], index) => ({
    name: name.length > 20 ? name.substring(0, 20) + '...' : name,
    fullName: name,
    size: data.totalRisk,
    threats: data.threats,
    avgRisk: data.avgRisk,
    fill: COLORS[index % COLORS.length],
  }));
  
  // Bar chart data for owner distribution
  const ownerData = Object.entries(ownerDist)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({
      name: name.length > 15 ? name.substring(0, 15) + '...' : name,
      fullName: name,
      count,
    }));
  
  // STRIDE distribution data
  const strideData = threats.reduce((acc, threat) => {
    const category = threat.strideCategory;
    if (!acc[category]) acc[category] = 0;
    acc[category]++;
    return acc;
  }, {} as Record<string, number>);
  
  const stridePieData = Object.entries(strideData).map(([name, value], index) => ({
    name: name.length > 20 ? name.substring(0, 20) + '...' : name,
    value,
    fill: COLORS[index % COLORS.length],
  }));

  // Custom treemap content
  const CustomizedContent = (props: any) => {
    const { x, y, width, height, name, threats, avgRisk, fill } = props;
    
    if (width < 50 || height < 30) return null;
    
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} fill={fill} stroke="#fff" strokeWidth={2} rx={4} />
        <text x={x + width / 2} y={y + height / 2 - 8} textAnchor="middle" fill="#fff" fontSize={12} fontWeight="bold">
          {name}
        </text>
        <text x={x + width / 2} y={y + height / 2 + 8} textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize={10}>
          {threats} threats
        </text>
        <text x={x + width / 2} y={y + height / 2 + 22} textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize={10}>
          Risk: {avgRisk}
        </text>
      </g>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-100 flex items-center gap-2">
              <Server className="h-4 w-4" />
              Attack Surface
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Object.keys(componentRisk).length}</div>
            <p className="text-xs text-indigo-200 mt-1">Unique components</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Highest Risk Component
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rankedComponents.length > 0 ? (
              <>
                <div className="text-sm font-bold truncate">
                  {rankedComponents[0][0]}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Risk Score: {rankedComponents[0][1].avgRisk}
                </p>
              </>
            ) : (
              <div className="text-muted-foreground">N/A</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Ownership Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Object.keys(ownerDist).length}</div>
            <p className="text-xs text-muted-foreground mt-1">Responsible teams</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Layers className="h-4 w-4" />
              STRIDE Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Object.keys(strideData).length}</div>
            <p className="text-xs text-muted-foreground mt-1">Threat categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Attack Surface Treemap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Attack Surface Map
          </CardTitle>
          <CardDescription>
            Component risk exposure visualization (size = total risk exposure)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <Treemap
              data={treemapData}
              dataKey="size"
              aspectRatio={4 / 3}
              stroke="#fff"
              content={<CustomizedContent />}
            />
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Component Risk Table + Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Component Risk Ranking */}
        <Card>
          <CardHeader>
            <CardTitle>Component Risk Ranking</CardTitle>
            <CardDescription>Top components by risk exposure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rankedComponents.map(([name, data], index) => (
                <div key={name} className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm truncate max-w-[200px]">{name}</div>
                      <div className="text-xs text-muted-foreground">
                        {data.threats} threats • {data.critical} critical/high
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      data.avgRisk >= 7 ? 'text-red-600' :
                      data.avgRisk >= 5 ? 'text-orange-600' :
                      'text-green-600'
                    }`}>
                      {data.avgRisk}
                    </div>
                    <div className="text-xs text-muted-foreground">avg risk</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Owner Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Ownership Distribution</CardTitle>
            <CardDescription>Threats by responsible team</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={ownerData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* STRIDE Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Threat Category Distribution (STRIDE)</CardTitle>
          <CardDescription>Breakdown of threats by STRIDE methodology</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stridePieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  dataKey="value"
                >
                  {stridePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="space-y-3">
              {Object.entries(strideData)
                .sort((a, b) => b[1] - a[1])
                .map(([category, count], index) => (
                  <div key={category} className="flex items-center justify-between p-2 rounded border">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium">{category}</span>
                    </div>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
