'use client';

import { Threat } from '@/lib/db/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { calculateFrameworkCoverage, getComplianceControlsForThreat, ComplianceFramework } from '@/lib/compliance-mapping';
import { 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';
import { Shield, CheckCircle2, AlertTriangle, BookOpen } from 'lucide-react';

interface ComplianceDashboardProps {
  threats: Threat[];
}

export default function ComplianceDashboard({ threats }: ComplianceDashboardProps) {
  const frameworkCoverage = calculateFrameworkCoverage(threats);
  
  // Prepare data for radar chart
  const radarData = frameworkCoverage.map(fc => ({
    framework: fc.framework.replace('Controls', '').replace('Top 10', ''),
    coverage: fc.coveragePercent,
    fullMark: 100,
  }));
  
  // Prepare data for bar chart
  const barData = frameworkCoverage.map(fc => ({
    name: fc.framework.replace(' Controls', '').replace(' Top 10', ''),
    covered: fc.coveredControls,
    total: fc.totalControls,
    gaps: fc.totalControls - fc.coveredControls,
  }));
  
  // Calculate overall compliance score
  const overallScore = Math.round(
    frameworkCoverage.reduce((sum, fc) => sum + fc.coveragePercent, 0) / frameworkCoverage.length
  );
  
  // Get color based on coverage
  const getCoverageColor = (percent: number) => {
    if (percent >= 80) return 'text-green-600';
    if (percent >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getCoverageBadge = (percent: number) => {
    if (percent >= 80) return 'bg-green-100 text-green-800';
    if (percent >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Header Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">
              Overall Compliance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{overallScore}%</div>
            <p className="text-xs text-blue-200 mt-1">
              Across {frameworkCoverage.length} frameworks
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Controls Covered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {frameworkCoverage.reduce((sum, fc) => sum + fc.coveredControls, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              of {frameworkCoverage.reduce((sum, fc) => sum + fc.totalControls, 0)} total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Control Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {frameworkCoverage.reduce((sum, fc) => sum + fc.gaps.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Require attention
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Frameworks Tracked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{frameworkCoverage.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Industry standards
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Framework Coverage Overview</CardTitle>
            <CardDescription>Compliance coverage across frameworks</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="framework" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Coverage"
                  dataKey="coverage"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Controls by Framework</CardTitle>
            <CardDescription>Covered vs total controls</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={barData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="covered" stackId="a" fill="#16a34a" name="Covered" />
                <Bar dataKey="gaps" stackId="a" fill="#dc2626" name="Gaps" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Framework Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Framework Details</CardTitle>
          <CardDescription>Detailed control coverage by framework</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="NIST CSF" className="space-y-4">
            <TabsList className="flex-wrap h-auto gap-1">
              {frameworkCoverage.map(fc => (
                <TabsTrigger key={fc.framework} value={fc.framework} className="text-xs">
                  {fc.framework.replace(' Controls', '')}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {frameworkCoverage.map(fc => (
              <TabsContent key={fc.framework} value={fc.framework} className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-lg">{fc.framework}</h3>
                    <p className="text-sm text-muted-foreground">
                      {fc.coveredControls} of {fc.totalControls} controls covered
                    </p>
                  </div>
                  <Badge className={getCoverageBadge(fc.coveragePercent)}>
                    {fc.coveragePercent}% Coverage
                  </Badge>
                </div>
                
                {/* Coverage Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Coverage Progress</span>
                    <span className={getCoverageColor(fc.coveragePercent)}>
                      {fc.coveragePercent}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        fc.coveragePercent >= 80 ? 'bg-green-500' :
                        fc.coveragePercent >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${fc.coveragePercent}%` }}
                    />
                  </div>
                </div>
                
                {/* Control Gaps */}
                {fc.gaps.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      Control Gaps ({fc.gaps.length})
                    </h4>
                    <div className="grid gap-2 md:grid-cols-2">
                      {fc.gaps.slice(0, 6).map(gap => (
                        <div key={gap.id} className="p-3 border rounded-lg bg-red-50 border-red-200">
                          <div className="font-mono text-sm font-medium">{gap.id}</div>
                          <div className="text-sm font-medium mt-1">{gap.name}</div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {gap.description}
                          </p>
                        </div>
                      ))}
                    </div>
                    {fc.gaps.length > 6 && (
                      <p className="text-sm text-muted-foreground">
                        + {fc.gaps.length - 6} more gaps...
                      </p>
                    )}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
