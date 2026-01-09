'use client';

import { Threat } from '@/lib/db/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateSecurityMetrics, generateTrendData, calculateMTTR } from '@/lib/security-metrics';
import { calculateRiskMetrics, calculateAllRiskScores } from '@/lib/risk-scoring';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar 
} from 'recharts';
import { 
  Shield, AlertTriangle, TrendingUp, TrendingDown, Clock, 
  Target, CheckCircle2, AlertCircle, Activity, Zap
} from 'lucide-react';

interface ExecutiveDashboardProps {
  threats: Threat[];
}

export default function ExecutiveDashboard({ threats }: ExecutiveDashboardProps) {
  const metrics = calculateSecurityMetrics(threats);
  const riskMetrics = calculateRiskMetrics(threats);
  const trendData = generateTrendData(threats);
  const mttr = calculateMTTR(threats);
  const riskScores = calculateAllRiskScores(threats);
  
  // Calculate overall security posture score (0-100)
  const securityPosture = Math.round(
    ((metrics.slaComplianceRate * 0.3) +
    (metrics.riskReductionProgress * 0.3) +
    (metrics.mitigationCoverage * 0.2) +
    ((100 - (riskMetrics.averageRiskScore * 10)) * 0.2))
  );
  
  // Data for radial chart
  const postureData = [
    { name: 'Security Posture', value: securityPosture, fill: getPostureColor(securityPosture) },
  ];
  
  // Get trend icon and color
  const getTrendIndicator = () => {
    if (riskMetrics.trendDirection === 'improving') {
      return { icon: TrendingDown, color: 'text-green-600', text: 'Improving' };
    } else if (riskMetrics.trendDirection === 'worsening') {
      return { icon: TrendingUp, color: 'text-red-600', text: 'Worsening' };
    }
    return { icon: Activity, color: 'text-yellow-600', text: 'Stable' };
  };
  
  const trend = getTrendIndicator();
  const TrendIcon = trend.icon;

  return (
    <div className="space-y-6">
      {/* Top KPI Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Security Posture Score */}
        <Card className="col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Security Posture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold">{securityPosture}</div>
                <p className="text-xs text-slate-400 mt-1">
                  out of 100
                </p>
              </div>
              <div className="h-20 w-20">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="100%"
                    data={postureData}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar
                      dataKey="value"
                      cornerRadius={10}
                      background={{ fill: 'rgba(255,255,255,0.1)' }}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className={`flex items-center gap-1 mt-2 ${trend.color}`}>
              <TrendIcon className="h-4 w-4" />
              <span className="text-sm">{trend.text}</span>
            </div>
          </CardContent>
        </Card>

        {/* Risk Exposure */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Risk Exposure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">{riskMetrics.totalRiskExposure}</div>
            <p className="text-xs text-red-600 mt-1">
              Avg Score: {riskMetrics.averageRiskScore}/10
            </p>
            <div className="mt-3 flex gap-2">
              <Badge className="bg-red-600">{riskMetrics.criticalCount} Critical</Badge>
              <Badge className="bg-orange-500">{riskMetrics.highCount} High</Badge>
            </div>
          </CardContent>
        </Card>

        {/* SLA Compliance */}
        <Card className={metrics.slaComplianceRate >= 90 ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              SLA Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${metrics.slaComplianceRate >= 90 ? 'text-green-700' : 'text-yellow-700'}`}>
              {metrics.slaComplianceRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Target: 95%
            </p>
            {metrics.p0BreachingCount > 0 && (
              <div className="mt-3">
                <Badge variant="destructive">{metrics.p0BreachingCount} P0 Breaching</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mean Time to Remediate */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              MTTR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mttr}</div>
            <p className="text-xs text-muted-foreground mt-1">
              days (Mean Time to Remediate)
            </p>
            <div className="mt-3 text-sm">
              <span className="text-muted-foreground">Velocity: </span>
              <span className="font-medium">{metrics.threatVelocity} threats/month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <StatusCard 
          title="Critical P0" 
          count={metrics.p0Threats} 
          icon={AlertCircle}
          color="red"
          subtitle="Due in 30 days"
        />
        <StatusCard 
          title="Open" 
          count={metrics.openThreats} 
          icon={Shield}
          color="red"
          subtitle="Need attention"
        />
        <StatusCard 
          title="In Progress" 
          count={metrics.inProgressThreats} 
          icon={Activity}
          color="blue"
          subtitle="Being worked"
        />
        <StatusCard 
          title="Mitigated" 
          count={metrics.mitigatedThreats} 
          icon={CheckCircle2}
          color="green"
          subtitle="Controls applied"
        />
        <StatusCard 
          title="Risk Accepted" 
          count={metrics.acceptedRiskThreats} 
          icon={Target}
          color="yellow"
          subtitle="Documented"
        />
      </div>

      {/* Trend Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Risk Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Risk Trend
            </CardTitle>
            <CardDescription>6-month risk score progression</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="riskScore" 
                  stroke="#dc2626" 
                  fill="url(#riskGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Threat Resolution Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Threat Resolution Trend
            </CardTitle>
            <CardDescription>Open vs Mitigated threats over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="openThreats" 
                  stroke="#dc2626" 
                  strokeWidth={2}
                  name="Open"
                />
                <Line 
                  type="monotone" 
                  dataKey="mitigatedThreats" 
                  stroke="#16a34a" 
                  strokeWidth={2}
                  name="Mitigated"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Coverage Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Coverage & Completeness</CardTitle>
          <CardDescription>How well threats are documented and addressed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <CoverageMetric
              title="Risk Reduction"
              value={metrics.riskReductionProgress}
              description="Initial risk mitigated"
            />
            <CoverageMetric
              title="Owner Assignment"
              value={metrics.ownerCoverage}
              description="Threats with owners"
            />
            <CoverageMetric
              title="Mitigation Plans"
              value={metrics.mitigationCoverage}
              description="Threats with mitigation defined"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusCard({ 
  title, 
  count, 
  icon: Icon, 
  color, 
  subtitle 
}: { 
  title: string; 
  count: number; 
  icon: React.ElementType; 
  color: 'red' | 'blue' | 'green' | 'yellow';
  subtitle: string;
}) {
  const colorClasses = {
    red: 'text-red-600 bg-red-50 border-red-200',
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  };

  return (
    <Card className={colorClasses[color]}>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{title}</p>
            <div className="text-2xl font-bold">{count}</div>
            <p className="text-xs opacity-75">{subtitle}</p>
          </div>
          <Icon className="h-8 w-8 opacity-50" />
        </div>
      </CardContent>
    </Card>
  );
}

function CoverageMetric({ title, value, description }: { title: string; value: number; description: string }) {
  const color = value >= 80 ? 'bg-green-500' : value >= 50 ? 'bg-yellow-500' : 'bg-red-500';
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-sm font-bold">{value}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function getPostureColor(score: number): string {
  if (score >= 80) return '#16a34a';
  if (score >= 60) return '#ca8a04';
  if (score >= 40) return '#ea580c';
  return '#dc2626';
}
