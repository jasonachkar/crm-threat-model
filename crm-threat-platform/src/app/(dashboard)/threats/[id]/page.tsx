import { db } from '@/lib/db';
import { threats } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, Edit, Shield, AlertTriangle, Info, Target, 
  ExternalLink, CheckCircle2, BookOpen, Crosshair, FileStack
} from 'lucide-react';
import Link from 'next/link';
import { calculateRiskScore } from '@/lib/risk-scoring';
import { getComplianceControlsForThreat } from '@/lib/compliance-mapping';
import { getThreatAttackMapping, ATTACK_TACTICS } from '@/lib/mitre-attack';

export default async function ThreatDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const [threat] = await db.select().from(threats).where(eq(threats.id, id)).limit(1);

  if (!threat) {
    notFound();
  }

  const riskScore = calculateRiskScore(threat);
  const complianceControls = getComplianceControlsForThreat(threat);
  const attackMapping = getThreatAttackMapping(threat);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'bg-red-600';
      case 'MEDIUM': return 'bg-orange-500';
      case 'LOW': return 'bg-green-600';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P0': return 'bg-red-600';
      case 'P1': return 'bg-orange-500';
      case 'P2': return 'bg-blue-600';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Mitigated': return 'bg-green-100 text-green-800';
      case 'Accepted Risk': return 'bg-yellow-100 text-yellow-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'from-red-600 to-red-700';
      case 'High': return 'from-orange-500 to-orange-600';
      case 'Medium': return 'from-yellow-500 to-yellow-600';
      case 'Low': return 'from-green-500 to-green-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  // Group compliance controls by framework
  const controlsByFramework = complianceControls.reduce((acc, control) => {
    if (!acc[control.framework]) acc[control.framework] = [];
    acc[control.framework].push(control);
    return acc;
  }, {} as Record<string, typeof complianceControls>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
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
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground font-mono text-lg">{threat.id}</span>
            <Badge variant="outline">{threat.strideCategory}</Badge>
          </div>
        </div>
        <Button>
          <Edit className="mr-2 h-4 w-4" />
          Edit Threat
        </Button>
      </div>

      {/* Risk Score Hero Card */}
      <Card className={`bg-gradient-to-r ${getRiskColor(riskScore.riskLevel)} text-white`}>
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-5xl font-bold">{riskScore.overall.toFixed(1)}</div>
                <div className="text-sm opacity-80">Risk Score</div>
              </div>
              <div className="border-l border-white/30 pl-6 space-y-1">
                <div className="text-lg font-semibold">{riskScore.riskLevel} Risk</div>
                <div className="text-sm opacity-80">{riskScore.percentile}th percentile</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold">{riskScore.impactScore.toFixed(1)}</div>
                <div className="text-xs opacity-80">Impact Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{(riskScore.likelihoodScore * 100).toFixed(0)}%</div>
                <div className="text-xs opacity-80">Likelihood</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{riskScore.baseScore.toFixed(1)}</div>
                <div className="text-xs opacity-80">Base Score</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">OWASP Mapping</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">{threat.owaspMapping || 'N/A'}</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details" className="gap-2">
            <Info className="h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="compliance" className="gap-2">
            <FileStack className="h-4 w-4" />
            Compliance ({complianceControls.length})
          </TabsTrigger>
          <TabsTrigger value="attack" className="gap-2">
            <Crosshair className="h-4 w-4" />
            ATT&CK ({attackMapping.techniques.length})
          </TabsTrigger>
          <TabsTrigger value="mitigation" className="gap-2">
            <Shield className="h-4 w-4" />
            Mitigation
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
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
                Impact Analysis (CIA Triad)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <ImpactMeter label="Confidentiality" value={threat.impactConfidentiality} />
                <ImpactMeter label="Integrity" value={threat.impactIntegrity} />
                <ImpactMeter label="Availability" value={threat.impactAvailability} />
              </div>
              <div className="pt-4 border-t grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm font-medium mb-2">Likelihood</div>
                  <Badge variant="outline" className="text-lg">{threat.likelihood}</Badge>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">Asset at Risk</div>
                  <p className="text-sm text-muted-foreground">{threat.asset}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Affected Components & Owner */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Affected Components
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {threat.affectedComponents.split('|').map((component, i) => (
                    <Badge key={i} variant="secondary">{component.trim()}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Ownership
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm font-medium">Owner</div>
                    <p className="text-sm text-muted-foreground">{threat.owner}</p>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Created</div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(threat.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileStack className="h-5 w-5" />
                Compliance Framework Mapping
              </CardTitle>
              <CardDescription>
                This threat maps to {complianceControls.length} controls across {Object.keys(controlsByFramework).length} frameworks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(controlsByFramework).map(([framework, controls]) => (
                  <div key={framework}>
                    <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                      <Badge variant="outline">{framework}</Badge>
                      <span className="text-muted-foreground">{controls.length} controls</span>
                    </h4>
                    <div className="grid gap-2 md:grid-cols-2">
                      {controls.map((control) => (
                        <div key={control.id} className="p-3 rounded-lg border bg-slate-50">
                          <div className="font-mono text-sm font-medium">{control.id}</div>
                          <div className="text-sm font-medium mt-1">{control.name}</div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {control.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ATT&CK Tab */}
        <TabsContent value="attack" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crosshair className="h-5 w-5" />
                MITRE ATT&CK Mapping
              </CardTitle>
              <CardDescription>
                This threat maps to {attackMapping.tactics.length} tactics and {attackMapping.techniques.length} techniques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Tactics */}
                <div>
                  <h4 className="font-medium text-sm mb-3">Tactics</h4>
                  <div className="flex flex-wrap gap-2">
                    {attackMapping.tactics.map((tactic) => (
                      <Badge 
                        key={tactic.id}
                        style={{ backgroundColor: tactic.color }}
                        className="text-white"
                      >
                        {tactic.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Techniques */}
                <div>
                  <h4 className="font-medium text-sm mb-3">Techniques</h4>
                  <div className="grid gap-2 md:grid-cols-2">
                    {attackMapping.techniques.map((technique) => {
                      const tactic = ATTACK_TACTICS[technique.tacticId];
                      return (
                        <a
                          key={technique.id}
                          href={technique.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-lg border hover:bg-slate-50 transition-colors group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-mono text-sm font-medium">{technique.id}</div>
                            <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
                          </div>
                          <div className="text-sm font-medium mt-1">{technique.name}</div>
                          <div className="flex items-center gap-2 mt-2">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: tactic?.color }}
                            />
                            <span className="text-xs text-muted-foreground">{tactic?.name}</span>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mitigation Tab */}
        <TabsContent value="mitigation" className="space-y-4">
          {threat.mitigationPrimary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Primary Mitigation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{threat.mitigationPrimary}</p>
              </CardContent>
            </Card>
          )}

          {threat.mitigationAdditional && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Mitigations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">{threat.mitigationAdditional}</p>
              </CardContent>
            </Card>
          )}

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

          {(threat.notes || threat.references) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Additional Information
                </CardTitle>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ImpactMeter({ label, value }: { label: string; value: string }) {
  const levels = ['None', 'Low', 'Medium', 'High', 'Critical'];
  const index = levels.indexOf(value);
  const percentage = index >= 0 ? ((index + 1) / levels.length) * 100 : 50;
  
  const getColor = () => {
    if (index >= 4) return 'bg-red-500';
    if (index >= 3) return 'bg-orange-500';
    if (index >= 2) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        <Badge variant="outline">{value}</Badge>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getColor()} transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
