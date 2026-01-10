'use client';

import { Threat } from '@/lib/db/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { calculateRiskScore } from '@/lib/risk-scoring';
import Link from 'next/link';

interface RiskHeatMapProps {
  threats: Threat[];
}

// Likelihood levels (Y-axis)
const LIKELIHOOD_LEVELS = ['High', 'Medium', 'Low'];

// Impact levels (X-axis) - based on average CIA impact
const IMPACT_LEVELS = ['Low', 'Medium', 'High', 'Critical'];

export default function RiskHeatMap({ threats }: RiskHeatMapProps) {
  // Group threats by likelihood and impact
  const threatMatrix: Record<string, Record<string, Threat[]>> = {};
  
  LIKELIHOOD_LEVELS.forEach(likelihood => {
    threatMatrix[likelihood] = {};
    IMPACT_LEVELS.forEach(impact => {
      threatMatrix[likelihood][impact] = [];
    });
  });
  
  // Categorize each threat
  threats.forEach(threat => {
    const likelihood = threat.likelihood;
    
    // Calculate average impact level
    const impactValues = {
      'None': 0, 'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 4,
    };
    const avgImpact = (
      (impactValues[threat.impactConfidentiality as keyof typeof impactValues] || 2) +
      (impactValues[threat.impactIntegrity as keyof typeof impactValues] || 2) +
      (impactValues[threat.impactAvailability as keyof typeof impactValues] || 2)
    ) / 3;
    
    let impactLevel: string;
    if (avgImpact >= 3.5) impactLevel = 'Critical';
    else if (avgImpact >= 2.5) impactLevel = 'High';
    else if (avgImpact >= 1.5) impactLevel = 'Medium';
    else impactLevel = 'Low';
    
    // Handle likelihood variations
    const normalizedLikelihood = likelihood.includes('Low') ? 'Low' : 
                                 likelihood.includes('High') ? 'High' : 'Medium';
    
    if (threatMatrix[normalizedLikelihood] && threatMatrix[normalizedLikelihood][impactLevel]) {
      threatMatrix[normalizedLikelihood][impactLevel].push(threat);
    }
  });
  
  // Get cell color based on risk level
  const getCellColor = (likelihood: string, impact: string): string => {
    const likelihoodScore = likelihood === 'High' ? 3 : likelihood === 'Medium' ? 2 : 1;
    const impactScore = impact === 'Critical' ? 4 : impact === 'High' ? 3 : impact === 'Medium' ? 2 : 1;
    const riskScore = likelihoodScore * impactScore;
    
    if (riskScore >= 9) return 'bg-red-600 hover:bg-red-700 text-white';
    if (riskScore >= 6) return 'bg-orange-500 hover:bg-orange-600 text-white';
    if (riskScore >= 3) return 'bg-yellow-400 hover:bg-yellow-500 text-black';
    return 'bg-green-400 hover:bg-green-500 text-black';
  };
  
  // Get risk level label
  const getRiskLabel = (likelihood: string, impact: string): string => {
    const likelihoodScore = likelihood === 'High' ? 3 : likelihood === 'Medium' ? 2 : 1;
    const impactScore = impact === 'Critical' ? 4 : impact === 'High' ? 3 : impact === 'Medium' ? 2 : 1;
    const riskScore = likelihoodScore * impactScore;
    
    if (riskScore >= 9) return 'Critical';
    if (riskScore >= 6) return 'High';
    if (riskScore >= 3) return 'Medium';
    return 'Low';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="h-5 w-5 bg-gradient-to-r from-green-500 via-yellow-500 to-red-600 rounded" />
          Risk Heat Map
        </CardTitle>
        <CardDescription>
          Threats plotted by Likelihood vs Impact (click cells to explore)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Header Row */}
            <div className="grid grid-cols-5 gap-1 mb-1">
              <div className="p-2 text-center font-medium text-sm bg-slate-100 rounded">
                Likelihood ↓ / Impact →
              </div>
              {IMPACT_LEVELS.map(impact => (
                <div key={impact} className="p-2 text-center font-medium text-sm bg-slate-100 rounded">
                  {impact}
                </div>
              ))}
            </div>
            
            {/* Matrix Rows */}
            {LIKELIHOOD_LEVELS.map(likelihood => (
              <div key={likelihood} className="grid grid-cols-5 gap-1 mb-1">
                <div className="p-2 text-center font-medium text-sm bg-slate-100 rounded flex items-center justify-center">
                  {likelihood}
                </div>
                {IMPACT_LEVELS.map(impact => {
                  const cellThreats = threatMatrix[likelihood]?.[impact] || [];
                  const count = cellThreats.length;
                  
                  return (
                    <TooltipProvider key={`${likelihood}-${impact}`}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div 
                            className={`p-3 rounded cursor-pointer transition-all ${getCellColor(likelihood, impact)} 
                              ${count > 0 ? 'shadow-md' : 'opacity-50'}`}
                          >
                            <div className="text-center">
                              <div className="text-2xl font-bold">{count}</div>
                              <div className="text-xs opacity-80">{getRiskLabel(likelihood, impact)}</div>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-sm">
                          <div className="space-y-2">
                            <div className="font-medium">
                              {likelihood} Likelihood × {impact} Impact
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {count} threat{count !== 1 ? 's' : ''} in this zone
                            </div>
                            {cellThreats.slice(0, 5).map(t => (
                              <Link 
                                key={t.id} 
                                href={`/threats/${t.id}`}
                                className="block text-xs p-1 bg-slate-100 rounded hover:bg-slate-200"
                              >
                                <span className="font-mono">{t.id}</span>: {t.title.substring(0, 40)}...
                              </Link>
                            ))}
                            {count > 5 && (
                              <div className="text-xs text-muted-foreground">
                                +{count - 5} more...
                              </div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-600" />
            <span className="text-sm">Critical Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500" />
            <span className="text-sm">High Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-400" />
            <span className="text-sm">Medium Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-400" />
            <span className="text-sm">Low Risk</span>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-4 gap-4 text-center">
          {['Critical', 'High', 'Medium', 'Low'].map(level => {
            const count = threats.filter(t => {
              const score = calculateRiskScore(t);
              return score.riskLevel === level;
            }).length;
            const colors = {
              'Critical': 'text-red-600',
              'High': 'text-orange-600',
              'Medium': 'text-yellow-600',
              'Low': 'text-green-600',
            };
            return (
              <div key={level}>
                <div className={`text-2xl font-bold ${colors[level as keyof typeof colors]}`}>
                  {count}
                </div>
                <div className="text-sm text-muted-foreground">{level} Risk</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
