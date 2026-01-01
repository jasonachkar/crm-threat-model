import { db } from '@/lib/db';
import { threats } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Shield, AlertTriangle, Info, Target } from 'lucide-react';
import Link from 'next/link';

export default async function ThreatDetailPage({ params }: { params: { id: string } }) {
  const [threat] = await db.select().from(threats).where(eq(threats.id, params.id)).limit(1);

  if (!threat) {
    notFound();
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return 'bg-red-600';
      case 'MEDIUM':
        return 'bg-orange-500';
      case 'LOW':
        return 'bg-green-600';
      default:
        return 'bg-gray-500';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-red-100 text-red-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Mitigated':
        return 'bg-green-100 text-green-800';
      case 'Accepted Risk':
        return 'bg-yellow-100 text-yellow-800';
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/threats">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Threats
              </Button>
            </Link>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">{threat.title}</h2>
          <p className="text-muted-foreground font-mono">{threat.id}</p>
        </div>
        <Button>
          <Edit className="mr-2 h-4 w-4" />
          Edit Threat
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">STRIDE Category</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-sm">
              {threat.strideCategory}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getSeverityColor(threat.severity)}>{threat.severity}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getPriorityColor(threat.priority)}>{threat.priority}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className={getStatusColor(threat.status)}>
              {threat.status}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Attack Scenario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Attack Scenario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{threat.attackScenario}</p>
        </CardContent>
      </Card>

      {/* Impact Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Impact Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-sm font-medium mb-2">Confidentiality</div>
              <Badge variant="outline">{threat.impactConfidentiality}</Badge>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">Integrity</div>
              <Badge variant="outline">{threat.impactIntegrity}</Badge>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">Availability</div>
              <Badge variant="outline">{threat.impactAvailability}</Badge>
            </div>
          </div>
          <div className="pt-4 border-t">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm font-medium mb-2">Likelihood</div>
                <Badge variant="outline">{threat.likelihood}</Badge>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">OWASP Mapping</div>
                <Badge variant="outline">{threat.owaspMapping || 'N/A'}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Affected Components & Asset */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Affected Components
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{threat.affectedComponents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Target Asset
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{threat.asset}</p>
          </CardContent>
        </Card>
      </div>

      {/* Ownership & Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Ownership & Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm font-medium mb-2">Owner</div>
              <p className="text-sm text-muted-foreground">{threat.owner}</p>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">Created</div>
              <p className="text-sm text-muted-foreground">
                {new Date(threat.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mitigations */}
      {threat.mitigationPrimary && (
        <Card>
          <CardHeader>
            <CardTitle>Mitigations</CardTitle>
            <CardDescription>Recommended security controls and countermeasures</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium mb-2">Primary Mitigation</div>
              <p className="text-sm text-muted-foreground">{threat.mitigationPrimary}</p>
            </div>
            {threat.mitigationAdditional && (
              <div>
                <div className="text-sm font-medium mb-2">Additional Mitigations</div>
                <p className="text-sm text-muted-foreground">{threat.mitigationAdditional}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detection */}
      {(threat.detectionLogs || threat.detectionAlerts) && (
        <Card>
          <CardHeader>
            <CardTitle>Detection & Monitoring</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {threat.detectionLogs && (
              <div>
                <div className="text-sm font-medium mb-2">Logs to Monitor</div>
                <p className="text-sm text-muted-foreground">{threat.detectionLogs}</p>
              </div>
            )}
            {threat.detectionAlerts && (
              <div>
                <div className="text-sm font-medium mb-2">Alert Configuration</div>
                <p className="text-sm text-muted-foreground">{threat.detectionAlerts}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notes & References */}
      {(threat.notes || threat.references) && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {threat.notes && (
              <div>
                <div className="text-sm font-medium mb-2">Notes</div>
                <p className="text-sm text-muted-foreground">{threat.notes}</p>
              </div>
            )}
            {threat.references && (
              <div>
                <div className="text-sm font-medium mb-2">References</div>
                <p className="text-sm text-muted-foreground">{threat.references}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
