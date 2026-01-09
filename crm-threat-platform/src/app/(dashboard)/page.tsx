import { db } from '@/lib/db';
import { threats } from '@/lib/db/schema';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Grid3X3, Activity } from 'lucide-react';
import ExecutiveDashboard from '@/components/executive-dashboard';
import DashboardCharts from '@/components/dashboard-charts';
import RiskHeatMap from '@/components/risk-heat-map';
import { ActivityFeedPlaceholder } from '@/components/activity-feed';
import ExportReport from '@/components/export-report';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Fetch all threats from database
  const allThreats = await db.select().from(threats);

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
    </div>
  );
}
