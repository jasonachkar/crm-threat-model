'use client';

import { Threat } from '@/lib/db/schema';
import { calculateRiskScore, RiskScore, formatRiskScore } from '@/lib/risk-scoring';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface RiskScoreBadgeProps {
  threat: Threat;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function RiskScoreBadge({ threat, showDetails = false, size = 'md' }: RiskScoreBadgeProps) {
  const score = calculateRiskScore(threat);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-lg px-4 py-2 font-bold',
  };
  
  const colorClasses = {
    'Critical': 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-red-200',
    'High': 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-orange-200',
    'Medium': 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-yellow-200',
    'Low': 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-200',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span 
            className={`inline-flex items-center gap-1 rounded-full shadow-sm cursor-help 
              ${sizeClasses[size]} ${colorClasses[score.riskLevel]}`}
          >
            <span className="font-bold">{formatRiskScore(score.overall)}</span>
            {showDetails && <span className="opacity-80">/ 10</span>}
          </span>
        </TooltipTrigger>
        <TooltipContent side="right" className="w-64">
          <RiskScoreDetails score={score} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function RiskScoreDetails({ score }: { score: RiskScore }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-medium">Risk Assessment</span>
        <Badge 
          style={{ backgroundColor: score.riskColor }}
          className="text-white"
        >
          {score.riskLevel}
        </Badge>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Overall Score</span>
          <span className="font-bold">{formatRiskScore(score.overall)} / 10</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Impact Score (CIA)</span>
          <span>{formatRiskScore(score.impactScore)} / 10</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Likelihood</span>
          <span>{Math.round(score.likelihoodScore * 100)}%</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Percentile</span>
          <span>{score.percentile}th</span>
        </div>
      </div>
      
      <div className="pt-2 border-t text-xs text-muted-foreground">
        Based on CVSS-like methodology combining impact, likelihood, and priority factors.
      </div>
    </div>
  );
}

// Standalone risk meter component
export function RiskMeter({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const percentage = (score / 10) * 100;
  
  const getColor = (score: number) => {
    if (score >= 8) return '#dc2626';
    if (score >= 6) return '#ea580c';
    if (score >= 4) return '#ca8a04';
    return '#16a34a';
  };
  
  const heights = { sm: 'h-2', md: 'h-3', lg: 'h-4' };
  
  return (
    <div className="space-y-1">
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heights[size]}`}>
        <div 
          className="h-full transition-all duration-500 rounded-full"
          style={{ 
            width: `${percentage}%`, 
            backgroundColor: getColor(score) 
          }}
        />
      </div>
    </div>
  );
}

// Risk score card for dashboard display
export function RiskScoreCard({ threat }: { threat: Threat }) {
  const score = calculateRiskScore(threat);
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-white shadow-sm">
      <div 
        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
        style={{ backgroundColor: score.riskColor }}
      >
        {formatRiskScore(score.overall)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{threat.title}</div>
        <div className="text-xs text-muted-foreground">{threat.id}</div>
      </div>
      <Badge variant="outline" className="text-xs">
        {score.riskLevel}
      </Badge>
    </div>
  );
}
