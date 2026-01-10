/**
 * Risk Scoring Engine
 * 
 * Implements a CVSS-like risk scoring system with automatic calculations.
 * This provides quantifiable metrics that security professionals and managers expect.
 */

import { Threat } from '@/lib/db/schema';

// Impact to numeric value mapping (0-10 scale)
export const IMPACT_VALUES: Record<string, number> = {
  'None': 0,
  'Low': 2.5,
  'Medium': 5,
  'High': 7.5,
  'Critical': 10,
  'CRITICAL': 10,
};

// Likelihood to probability mapping
export const LIKELIHOOD_VALUES: Record<string, number> = {
  'Low': 0.25,
  'Medium': 0.5,
  'High': 0.75,
  'Low-Med': 0.375,
};

// Severity to base score mapping
export const SEVERITY_VALUES: Record<string, number> = {
  'LOW': 3.0,
  'MEDIUM': 6.0,
  'HIGH': 9.0,
  'LOW-MED': 4.5,
  'MEDIUM-HIGH': 7.5,
};

// Priority to urgency multiplier
export const PRIORITY_MULTIPLIERS: Record<string, number> = {
  'P0': 1.5,
  'P1': 1.2,
  'P2': 1.0,
};

export interface RiskScore {
  overall: number;           // 0-10 composite score
  impactScore: number;       // 0-10 based on CIA triad
  likelihoodScore: number;   // 0-1 probability
  baseScore: number;         // 0-10 from severity
  adjustedScore: number;     // After priority adjustment
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  riskColor: string;
  percentile: number;        // Where this falls vs other threats
}

export interface RiskMetrics {
  totalRiskExposure: number;
  averageRiskScore: number;
  maxRiskScore: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  riskReductionPotential: number;  // If all mitigated
  trendDirection: 'improving' | 'stable' | 'worsening';
}

/**
 * Calculate the risk score for a single threat
 */
export function calculateRiskScore(threat: Threat): RiskScore {
  // Calculate CIA impact score (average of the three)
  const confidentialityImpact = IMPACT_VALUES[threat.impactConfidentiality] || 5;
  const integrityImpact = IMPACT_VALUES[threat.impactIntegrity] || 5;
  const availabilityImpact = IMPACT_VALUES[threat.impactAvailability] || 5;
  
  // Weighted average: Confidentiality often most important in security contexts
  const impactScore = (confidentialityImpact * 0.4 + integrityImpact * 0.35 + availabilityImpact * 0.25);
  
  // Likelihood as probability
  const likelihoodScore = LIKELIHOOD_VALUES[threat.likelihood] || 0.5;
  
  // Base score from severity
  const baseScore = SEVERITY_VALUES[threat.severity] || 6.0;
  
  // Priority adjustment
  const priorityMultiplier = PRIORITY_MULTIPLIERS[threat.priority] || 1.0;
  
  // Calculate composite score using CVSS-like formula
  // Risk = Impact × Likelihood × Priority Adjustment
  const rawScore = (impactScore * likelihoodScore * priorityMultiplier);
  
  // Blend with base severity for more stable scoring
  const adjustedScore = (rawScore * 0.6 + baseScore * 0.4);
  
  // Normalize to 0-10 scale
  const overall = Math.min(10, Math.max(0, adjustedScore));
  
  // Determine risk level
  let riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  let riskColor: string;
  
  if (overall >= 8) {
    riskLevel = 'Critical';
    riskColor = '#dc2626'; // red-600
  } else if (overall >= 6) {
    riskLevel = 'High';
    riskColor = '#ea580c'; // orange-600
  } else if (overall >= 4) {
    riskLevel = 'Medium';
    riskColor = '#ca8a04'; // yellow-600
  } else {
    riskLevel = 'Low';
    riskColor = '#16a34a'; // green-600
  }
  
  return {
    overall: Math.round(overall * 10) / 10,
    impactScore: Math.round(impactScore * 10) / 10,
    likelihoodScore,
    baseScore,
    adjustedScore: Math.round(adjustedScore * 10) / 10,
    riskLevel,
    riskColor,
    percentile: 0, // Will be calculated in aggregate
  };
}

/**
 * Calculate risk scores for all threats with percentile ranking
 */
export function calculateAllRiskScores(threats: Threat[]): Map<string, RiskScore> {
  const scores = new Map<string, RiskScore>();
  const allScores: number[] = [];
  
  // First pass: calculate all scores
  threats.forEach(threat => {
    const score = calculateRiskScore(threat);
    scores.set(threat.id, score);
    allScores.push(score.overall);
  });
  
  // Sort for percentile calculation
  allScores.sort((a, b) => a - b);
  
  // Second pass: add percentiles
  scores.forEach((score, id) => {
    const rank = allScores.filter(s => s <= score.overall).length;
    score.percentile = Math.round((rank / allScores.length) * 100);
  });
  
  return scores;
}

/**
 * Calculate aggregate risk metrics for the portfolio
 */
export function calculateRiskMetrics(threats: Threat[]): RiskMetrics {
  if (threats.length === 0) {
    return {
      totalRiskExposure: 0,
      averageRiskScore: 0,
      maxRiskScore: 0,
      criticalCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
      riskReductionPotential: 0,
      trendDirection: 'stable',
    };
  }
  
  const scores = calculateAllRiskScores(threats);
  let totalExposure = 0;
  let maxScore = 0;
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;
  let openRiskExposure = 0;
  
  threats.forEach(threat => {
    const score = scores.get(threat.id)!;
    totalExposure += score.overall;
    maxScore = Math.max(maxScore, score.overall);
    
    // Count by risk level
    switch (score.riskLevel) {
      case 'Critical': criticalCount++; break;
      case 'High': highCount++; break;
      case 'Medium': mediumCount++; break;
      case 'Low': lowCount++; break;
    }
    
    // Calculate potential risk reduction (if all open threats were mitigated)
    if (threat.status === 'Open' || threat.status === 'In Progress') {
      openRiskExposure += score.overall;
    }
  });
  
  const averageRiskScore = totalExposure / threats.length;
  const riskReductionPotential = openRiskExposure;
  
  // Determine trend based on status distribution
  const openCount = threats.filter(t => t.status === 'Open').length;
  const mitigatedCount = threats.filter(t => t.status === 'Mitigated' || t.status === 'Closed').length;
  
  let trendDirection: 'improving' | 'stable' | 'worsening';
  if (mitigatedCount > openCount) {
    trendDirection = 'improving';
  } else if (openCount > threats.length * 0.7) {
    trendDirection = 'worsening';
  } else {
    trendDirection = 'stable';
  }
  
  return {
    totalRiskExposure: Math.round(totalExposure * 10) / 10,
    averageRiskScore: Math.round(averageRiskScore * 10) / 10,
    maxRiskScore: Math.round(maxScore * 10) / 10,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    riskReductionPotential: Math.round(riskReductionPotential * 10) / 10,
    trendDirection,
  };
}

/**
 * Generate risk score display color gradient
 */
export function getRiskScoreGradient(score: number): string {
  if (score >= 8) return 'from-red-500 to-red-700';
  if (score >= 6) return 'from-orange-400 to-orange-600';
  if (score >= 4) return 'from-yellow-400 to-yellow-600';
  return 'from-green-400 to-green-600';
}

/**
 * Format risk score for display
 */
export function formatRiskScore(score: number): string {
  return score.toFixed(1);
}
