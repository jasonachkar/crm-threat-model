'use client';

import { Threat } from '@/lib/db/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  getThreatAttackMapping, 
  getAllTactics, 
  getAttackCoverage,
  ATTACK_TACTICS,
  ATTACK_TECHNIQUES 
} from '@/lib/mitre-attack';
import { ExternalLink, Target, Crosshair } from 'lucide-react';
import Link from 'next/link';

interface MitreAttackMatrixProps {
  threats: Threat[];
}

export default function MitreAttackMatrix({ threats }: MitreAttackMatrixProps) {
  const tactics = getAllTactics();
  const coverage = getAttackCoverage(threats);
  
  // Build technique-to-threats mapping
  const techniqueToThreats: Record<string, Threat[]> = {};
  threats.forEach(threat => {
    const mapping = getThreatAttackMapping(threat);
    mapping.techniques.forEach(technique => {
      if (!techniqueToThreats[technique.id]) {
        techniqueToThreats[technique.id] = [];
      }
      techniqueToThreats[technique.id].push(threat);
    });
  });
  
  // Get techniques for each tactic
  const tacticTechniques: Record<string, Array<{ id: string; name: string; count: number }>> = {};
  tactics.forEach(tactic => {
    tacticTechniques[tactic.id] = Object.values(ATTACK_TECHNIQUES)
      .filter(t => t.tacticId === tactic.id)
      .map(t => ({
        id: t.id,
        name: t.name,
        count: techniqueToThreats[t.id]?.length || 0,
      }))
      .sort((a, b) => b.count - a.count);
  });

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-purple-600 to-purple-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-100 flex items-center gap-2">
              <Target className="h-4 w-4" />
              MITRE ATT&CK Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{coverage.totalTacticsCovered}</div>
            <p className="text-xs text-purple-200 mt-1">
              of {Object.keys(ATTACK_TACTICS).length} tactics
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Crosshair className="h-4 w-4" />
              Techniques Mapped
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{coverage.totalTechniquesCovered}</div>
            <p className="text-xs text-muted-foreground mt-1">
              of {Object.keys(ATTACK_TECHNIQUES).length} tracked
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Most Common Tactic
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(coverage.tacticsCount).length > 0 ? (
              <>
                <div className="text-lg font-bold">
                  {ATTACK_TACTICS[Object.entries(coverage.tacticsCount).sort((a, b) => b[1] - a[1])[0][0]]?.shortName || 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {Object.entries(coverage.tacticsCount).sort((a, b) => b[1] - a[1])[0]?.[1] || 0} threats
                </p>
              </>
            ) : (
              <div className="text-lg font-bold text-muted-foreground">N/A</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Most Common Technique
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(coverage.techniquesCount).length > 0 ? (
              <>
                <div className="text-sm font-bold">
                  {ATTACK_TECHNIQUES[Object.entries(coverage.techniquesCount).sort((a, b) => b[1] - a[1])[0][0]]?.name.substring(0, 25) || 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {Object.entries(coverage.techniquesCount).sort((a, b) => b[1] - a[1])[0]?.[1] || 0} threats
                </p>
              </>
            ) : (
              <div className="text-lg font-bold text-muted-foreground">N/A</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ATT&CK Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">⚔️</span>
            MITRE ATT&CK Enterprise Matrix
          </CardTitle>
          <CardDescription>
            Threat coverage mapped to ATT&CK tactics and techniques
            <a 
              href="https://attack.mitre.org/matrices/enterprise/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-2 inline-flex items-center text-blue-600 hover:underline"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Full Matrix
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[1200px]">
              <div className="grid grid-cols-12 gap-1">
                {tactics.map(tactic => {
                  const tacticCount = coverage.tacticsCount[tactic.id] || 0;
                  const techniques = tacticTechniques[tactic.id] || [];
                  
                  return (
                    <div key={tactic.id} className="space-y-1">
                      {/* Tactic Header */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className="p-2 rounded text-white text-center cursor-help"
                              style={{ backgroundColor: tactic.color }}
                            >
                              <div className="text-xs font-medium">{tactic.shortName}</div>
                              {tacticCount > 0 && (
                                <Badge className="bg-white/20 text-white text-xs mt-1">
                                  {tacticCount}
                                </Badge>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <div className="max-w-xs">
                              <div className="font-medium">{tactic.name}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {tactic.description}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      {/* Techniques */}
                      <div className="space-y-1">
                        {techniques.slice(0, 5).map(technique => (
                          <TooltipProvider key={technique.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div 
                                  className={`p-1 rounded text-xs cursor-help transition-all
                                    ${technique.count > 0 
                                      ? 'bg-purple-100 border border-purple-300 hover:bg-purple-200' 
                                      : 'bg-gray-50 border border-gray-200 opacity-50'}`}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="truncate">{technique.name.substring(0, 15)}</span>
                                    {technique.count > 0 && (
                                      <span className="bg-purple-600 text-white px-1 rounded text-[10px]">
                                        {technique.count}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-sm">
                                <div className="space-y-2">
                                  <div className="font-medium">{technique.id}: {technique.name}</div>
                                  {technique.count > 0 && (
                                    <div className="text-xs">
                                      <div className="font-medium mb-1">Mapped Threats:</div>
                                      {techniqueToThreats[technique.id]?.slice(0, 3).map(t => (
                                        <Link 
                                          key={t.id}
                                          href={`/threats/${t.id}`}
                                          className="block p-1 bg-slate-100 rounded hover:bg-slate-200 mb-1"
                                        >
                                          {t.id}: {t.title.substring(0, 40)}...
                                        </Link>
                                      ))}
                                    </div>
                                  )}
                                  <a 
                                    href={ATTACK_TECHNIQUES[technique.id]?.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline inline-flex items-center"
                                  >
                                    View in MITRE ATT&CK <ExternalLink className="h-3 w-3 ml-1" />
                                  </a>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                        {techniques.length > 5 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{techniques.length - 5} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Techniques Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Attack Techniques</CardTitle>
          <CardDescription>Most frequently mapped techniques from threat analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(coverage.techniquesCount)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 10)
              .map(([id, count]) => {
                const technique = ATTACK_TECHNIQUES[id];
                const tactic = ATTACK_TACTICS[technique?.tacticId];
                if (!technique) return null;
                
                return (
                  <div key={id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tactic?.color || '#666' }}
                      />
                      <div>
                        <div className="font-medium text-sm">{technique.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {id} • {tactic?.name || 'Unknown Tactic'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{count} threat{count !== 1 ? 's' : ''}</Badge>
                      <a 
                        href={technique.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
