'use client';

import { AuditLog } from '@/lib/db/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, Edit, Trash2, Plus, Check, AlertTriangle, 
  User, Clock, ArrowRight, Shield
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface ActivityFeedProps {
  activities: AuditLog[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  // Group activities by date
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = new Date(activity.createdAt).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, AuditLog[]>);

  const getActionIcon = (action: string) => {
    if (action.includes('delete')) return { icon: Trash2, color: 'text-red-600 bg-red-100' };
    if (action.includes('create') || action.includes('add')) return { icon: Plus, color: 'text-green-600 bg-green-100' };
    if (action.includes('update') || action.includes('edit')) return { icon: Edit, color: 'text-blue-600 bg-blue-100' };
    if (action.includes('status')) return { icon: Check, color: 'text-purple-600 bg-purple-100' };
    return { icon: Activity, color: 'text-gray-600 bg-gray-100' };
  };

  const getActionLabel = (action: string): string => {
    const labels: Record<string, string> = {
      'update_threat_status': 'Updated threat status',
      'update_threat': 'Updated threat',
      'delete_threat': 'Deleted threat',
      'create_threat': 'Created threat',
      'update_requirement': 'Updated requirement',
      'update_mitigation': 'Updated mitigation',
    };
    return labels[action] || action.replace(/_/g, ' ');
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'Open': 'bg-red-100 text-red-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Mitigated': 'bg-green-100 text-green-800',
      'Closed': 'bg-gray-100 text-gray-800',
      'Accepted Risk': 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const renderChanges = (changes: any) => {
    if (!changes) return null;
    
    const { before, after } = changes;
    if (!before && !after) return null;

    // Status change
    if (before?.status && after?.status && before.status !== after.status) {
      return (
        <div className="flex items-center gap-2 mt-2 text-sm">
          <Badge className={getStatusBadge(before.status)}>{before.status}</Badge>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <Badge className={getStatusBadge(after.status)}>{after.status}</Badge>
        </div>
      );
    }

    // Other changes summary
    const changedFields = Object.keys(after || {}).filter(
      key => JSON.stringify(before?.[key]) !== JSON.stringify(after[key])
    ).filter(key => !['updatedAt', 'createdAt'].includes(key));

    if (changedFields.length > 0) {
      return (
        <div className="mt-2 text-xs text-muted-foreground">
          Changed: {changedFields.join(', ')}
        </div>
      );
    }

    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activity Feed
        </CardTitle>
        <CardDescription>
          Recent changes and updates to threat data
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedActivities).map(([date, dayActivities]) => (
              <div key={date}>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">{date}</h4>
                <div className="space-y-3">
                  {dayActivities.map((activity) => {
                    const { icon: ActionIcon, color } = getActionIcon(activity.action);
                    
                    return (
                      <div key={activity.id} className="flex gap-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
                          <ActionIcon className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium">
                                {getActionLabel(activity.action)}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Link 
                                  href={`/threats/${activity.entityId}`}
                                  className="text-sm text-blue-600 hover:underline font-mono"
                                >
                                  {activity.entityId}
                                </Link>
                                <Badge variant="outline" className="text-xs">
                                  {activity.entityType}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                            </div>
                          </div>
                          
                          {renderChanges(activity.changes)}
                          
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              User ID: {activity.userId.substring(0, 8)}...
                            </span>
                            {activity.ipAddress && (
                              <span>IP: {activity.ipAddress}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Placeholder component for when no audit logs exist
export function ActivityFeedPlaceholder() {
  const mockActivities = [
    {
      id: '1',
      action: 'update_threat_status',
      entityId: 'TM-001',
      entityType: 'threat',
      time: '2 hours ago',
      user: 'admin@crm-threat.com',
      before: 'Open',
      after: 'In Progress',
    },
    {
      id: '2',
      action: 'update_threat',
      entityId: 'TM-017',
      entityType: 'threat',
      time: '5 hours ago',
      user: 'editor@crm-threat.com',
      changes: 'severity, priority',
    },
    {
      id: '3',
      action: 'update_threat_status',
      entityId: 'TM-005',
      entityType: 'threat',
      time: '1 day ago',
      user: 'admin@crm-threat.com',
      before: 'In Progress',
      after: 'Mitigated',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activity Feed
        </CardTitle>
        <CardDescription>Recent changes and updates to threat data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockActivities.map((activity) => {
            const { icon: ActionIcon, color } = 
              activity.action.includes('status') 
                ? { icon: Check, color: 'text-purple-600 bg-purple-100' }
                : { icon: Edit, color: 'text-blue-600 bg-blue-100' };
            
            return (
              <div key={activity.id} className="flex gap-3 p-3 rounded-lg border hover:bg-slate-50">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
                  <ActionIcon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {activity.action === 'update_threat_status' ? 'Updated threat status' : 'Updated threat'}
                      </p>
                      <Link 
                        href={`/threats/${activity.entityId}`}
                        className="text-sm text-blue-600 hover:underline font-mono"
                      >
                        {activity.entityId}
                      </Link>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                  {activity.before && activity.after && (
                    <div className="flex items-center gap-2 mt-2 text-sm">
                      <Badge className={activity.before === 'Open' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
                        {activity.before}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <Badge className={activity.after === 'Mitigated' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                        {activity.after}
                      </Badge>
                    </div>
                  )}
                  {activity.changes && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Changed: {activity.changes}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-muted-foreground">
                    By: {activity.user}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
