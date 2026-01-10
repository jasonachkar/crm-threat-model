/**
 * Security Metrics Engine
 * 
 * Calculates key security performance indicators (KPIs) that managers
 * and executives expect to see. These metrics are industry-standard
 * for security programs.
 */

import { Threat } from '@/lib/db/schema';
import { calculateRiskScore } from './risk-scoring';

export interface SecurityMetrics {
  // Threat Metrics
  totalThreats: number;
  openThreats: number;
  mitigatedThreats: number;
  acceptedRiskThreats: number;
  inProgressThreats: number;
  closedThreats: number;
  
  // Risk Distribution
  criticalThreats: number;
  highThreats: number;
  mediumThreats: number;
  lowThreats: number;
  
  // Priority Distribution
  p0Threats: number;
  p1Threats: number;
  p2Threats: number;
  
  // Velocity Metrics
  threatVelocity: number;  // Threats resolved per month (estimated)
  avgAgeOpenThreats: number;  // Average age of open threats in days
  
  // SLA Metrics
  p0BreachingCount: number;  // P0 threats older than 30 days
  p1BreachingCount: number;  // P1 threats older than 90 days
  slaComplianceRate: number;  // Percentage within SLA
  
  // Risk Metrics
  totalRiskExposure: number;
  averageRiskScore: number;
  riskReductionProgress: number;  // Percentage of initial risk mitigated
  
  // Coverage Metrics
  ownerCoverage: number;  // Percentage of threats with owners
  mitigationCoverage: number;  // Percentage with mitigation plans
}

export interface TrendData {
  period: string;
  openThreats: number;
  mitigatedThreats: number;
  newThreats: number;
  riskScore: number;
}

export interface SLAStatus {
  threatId: string;
  priority: string;
  ageInDays: number;
  slaDays: number;
  status: 'compliant' | 'warning' | 'breaching';
  remainingDays: number;
}

// SLA definitions (in days)
export const SLA_DEFINITIONS: Record<string, number> = {
  'P0': 30,   // 30 days to mitigate P0
  'P1': 90,   // 90 days to mitigate P1
  'P2': 180,  // 180 days to mitigate P2
};

/**
 * Calculate comprehensive security metrics
 */
export function calculateSecurityMetrics(threats: Threat[]): SecurityMetrics {
  const now = new Date();
  
  // Status counts
  const openThreats = threats.filter(t => t.status === 'Open').length;
  const inProgressThreats = threats.filter(t => t.status === 'In Progress').length;
  const mitigatedThreats = threats.filter(t => t.status === 'Mitigated').length;
  const acceptedRiskThreats = threats.filter(t => t.status === 'Accepted Risk').length;
  const closedThreats = threats.filter(t => t.status === 'Closed').length;
  
  // Severity counts
  const criticalP0 = threats.filter(t => t.severity === 'HIGH' && t.priority === 'P0').length;
  const highThreats = threats.filter(t => t.severity === 'HIGH').length;
  const mediumThreats = threats.filter(t => t.severity === 'MEDIUM').length;
  const lowThreats = threats.filter(t => t.severity === 'LOW').length;
  
  // Priority counts
  const p0Threats = threats.filter(t => t.priority === 'P0').length;
  const p1Threats = threats.filter(t => t.priority === 'P1').length;
  const p2Threats = threats.filter(t => t.priority === 'P2').length;
  
  // Calculate average age of open threats
  const openThreatsList = threats.filter(t => t.status === 'Open' || t.status === 'In Progress');
  const avgAge = openThreatsList.length > 0
    ? openThreatsList.reduce((sum, t) => {
        const age = Math.floor((now.getTime() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        return sum + age;
      }, 0) / openThreatsList.length
    : 0;
  
  // Calculate SLA breaches
  const slaStatuses = threats.map(t => getSLAStatus(t));
  const p0Breaching = slaStatuses.filter(s => s.priority === 'P0' && s.status === 'breaching').length;
  const p1Breaching = slaStatuses.filter(s => s.priority === 'P1' && s.status === 'breaching').length;
  const compliantCount = slaStatuses.filter(s => s.status === 'compliant').length;
  const slaComplianceRate = threats.length > 0 ? (compliantCount / threats.length) * 100 : 100;
  
  // Risk calculations
  let totalRisk = 0;
  threats.forEach(t => {
    const score = calculateRiskScore(t);
    totalRisk += score.overall;
  });
  const averageRiskScore = threats.length > 0 ? totalRisk / threats.length : 0;
  
  // Risk reduction progress
  const mitigatedRisk = threats
    .filter(t => t.status === 'Mitigated' || t.status === 'Closed')
    .reduce((sum, t) => sum + calculateRiskScore(t).overall, 0);
  const riskReductionProgress = totalRisk > 0 ? (mitigatedRisk / totalRisk) * 100 : 0;
  
  // Coverage metrics
  const withOwners = threats.filter(t => t.owner && t.owner.trim() !== '').length;
  const withMitigations = threats.filter(t => t.mitigationPrimary && t.mitigationPrimary.trim() !== '').length;
  
  // Velocity: estimate based on ratio of mitigated to total
  const velocityEstimate = mitigatedThreats > 0 ? (mitigatedThreats / 3) : 0; // Assume 3 months of data
  
  return {
    totalThreats: threats.length,
    openThreats,
    mitigatedThreats,
    acceptedRiskThreats,
    inProgressThreats,
    closedThreats,
    criticalThreats: criticalP0,
    highThreats,
    mediumThreats,
    lowThreats,
    p0Threats,
    p1Threats,
    p2Threats,
    threatVelocity: Math.round(velocityEstimate * 10) / 10,
    avgAgeOpenThreats: Math.round(avgAge),
    p0BreachingCount: p0Breaching,
    p1BreachingCount: p1Breaching,
    slaComplianceRate: Math.round(slaComplianceRate),
    totalRiskExposure: Math.round(totalRisk * 10) / 10,
    averageRiskScore: Math.round(averageRiskScore * 10) / 10,
    riskReductionProgress: Math.round(riskReductionProgress),
    ownerCoverage: threats.length > 0 ? Math.round((withOwners / threats.length) * 100) : 0,
    mitigationCoverage: threats.length > 0 ? Math.round((withMitigations / threats.length) * 100) : 0,
  };
}

/**
 * Get SLA status for a threat
 */
export function getSLAStatus(threat: Threat): SLAStatus {
  const now = new Date();
  const createdAt = new Date(threat.createdAt);
  const ageInDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  const slaDays = SLA_DEFINITIONS[threat.priority] || 180;
  const remainingDays = slaDays - ageInDays;
  
  // If already mitigated/closed, it's compliant
  if (threat.status === 'Mitigated' || threat.status === 'Closed' || threat.status === 'Accepted Risk') {
    return {
      threatId: threat.id,
      priority: threat.priority,
      ageInDays,
      slaDays,
      status: 'compliant',
      remainingDays: 0,
    };
  }
  
  let status: 'compliant' | 'warning' | 'breaching';
  if (remainingDays < 0) {
    status = 'breaching';
  } else if (remainingDays <= (slaDays * 0.2)) {
    status = 'warning'; // Within 20% of SLA deadline
  } else {
    status = 'compliant';
  }
  
  return {
    threatId: threat.id,
    priority: threat.priority,
    ageInDays,
    slaDays,
    status,
    remainingDays: Math.max(0, remainingDays),
  };
}

/**
 * Generate mock trend data for visualization
 * In production, this would come from historical data
 */
export function generateTrendData(threats: Threat[]): TrendData[] {
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const baseOpen = threats.filter(t => t.status === 'Open').length;
  const baseMitigated = threats.filter(t => t.status === 'Mitigated' || t.status === 'Closed').length;
  
  return months.map((month, index) => {
    // Simulate trend showing improvement over time
    const progress = index / (months.length - 1);
    const openThreats = Math.round(baseOpen + (threats.length * 0.3 * (1 - progress)));
    const mitigatedThreats = Math.round(baseMitigated * progress);
    const newThreats = Math.round(Math.random() * 5 + 2);
    const riskScore = 7.5 - (progress * 2);
    
    return {
      period: month,
      openThreats,
      mitigatedThreats,
      newThreats,
      riskScore: Math.round(riskScore * 10) / 10,
    };
  });
}

/**
 * Calculate MTTR (Mean Time To Remediate) in days
 */
export function calculateMTTR(threats: Threat[]): number {
  const resolvedThreats = threats.filter(
    t => t.status === 'Mitigated' || t.status === 'Closed'
  );
  
  if (resolvedThreats.length === 0) return 0;
  
  // Estimate MTTR based on typical patterns
  // In production, you'd use actual resolution timestamps
  const estimatedDays = resolvedThreats.reduce((sum, threat) => {
    const baseDays = threat.priority === 'P0' ? 15 : threat.priority === 'P1' ? 45 : 90;
    return sum + baseDays;
  }, 0);
  
  return Math.round(estimatedDays / resolvedThreats.length);
}

/**
 * Get threat distribution by owner
 */
export function getOwnerDistribution(threats: Threat[]): Record<string, number> {
  const distribution: Record<string, number> = {};
  
  threats.forEach(threat => {
    const owner = threat.owner || 'Unassigned';
    distribution[owner] = (distribution[owner] || 0) + 1;
  });
  
  return distribution;
}

/**
 * Get threat distribution by component
 */
export function getComponentDistribution(threats: Threat[]): Record<string, number> {
  const distribution: Record<string, number> = {};
  
  threats.forEach(threat => {
    const components = threat.affectedComponents.split('|').map(c => c.trim());
    components.forEach(component => {
      if (component) {
        distribution[component] = (distribution[component] || 0) + 1;
      }
    });
  });
  
  return distribution;
}
