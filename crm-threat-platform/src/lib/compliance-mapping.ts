/**
 * Compliance Framework Mapping
 * 
 * Maps threats to major security frameworks that cloud security professionals
 * and auditors work with daily. This adds significant value for enterprise contexts.
 */

import { Threat } from '@/lib/db/schema';

// Compliance Framework Types
export interface ComplianceControl {
  id: string;
  name: string;
  description: string;
  framework: ComplianceFramework;
}

export type ComplianceFramework = 'NIST CSF' | 'CIS Controls' | 'ISO 27001' | 'SOC 2' | 'OWASP Top 10';

export interface ComplianceMapping {
  threatId: string;
  controls: ComplianceControl[];
}

export interface FrameworkCoverage {
  framework: ComplianceFramework;
  totalControls: number;
  coveredControls: number;
  coveragePercent: number;
  gaps: ComplianceControl[];
}

// NIST Cybersecurity Framework mappings
export const NIST_CSF_CONTROLS: Record<string, ComplianceControl> = {
  'ID.AM': { id: 'ID.AM', name: 'Asset Management', description: 'Identify and manage data, personnel, devices, systems, and facilities', framework: 'NIST CSF' },
  'ID.RA': { id: 'ID.RA', name: 'Risk Assessment', description: 'Understand cybersecurity risk to operations, assets, and individuals', framework: 'NIST CSF' },
  'PR.AC': { id: 'PR.AC', name: 'Identity Management & Access Control', description: 'Limit access to authorized users, processes, and devices', framework: 'NIST CSF' },
  'PR.DS': { id: 'PR.DS', name: 'Data Security', description: 'Manage information and records consistent with risk strategy', framework: 'NIST CSF' },
  'PR.IP': { id: 'PR.IP', name: 'Information Protection', description: 'Security policies, processes, and procedures maintained', framework: 'NIST CSF' },
  'PR.PT': { id: 'PR.PT', name: 'Protective Technology', description: 'Technical security solutions managed to ensure security', framework: 'NIST CSF' },
  'DE.AE': { id: 'DE.AE', name: 'Anomalies and Events', description: 'Anomalous activity is detected and understood', framework: 'NIST CSF' },
  'DE.CM': { id: 'DE.CM', name: 'Security Continuous Monitoring', description: 'Systems monitored to identify cybersecurity events', framework: 'NIST CSF' },
  'RS.AN': { id: 'RS.AN', name: 'Analysis', description: 'Analysis conducted to ensure effective response', framework: 'NIST CSF' },
  'RS.MI': { id: 'RS.MI', name: 'Mitigation', description: 'Activities performed to prevent expansion of event', framework: 'NIST CSF' },
  'RC.RP': { id: 'RC.RP', name: 'Recovery Planning', description: 'Recovery processes executed and maintained', framework: 'NIST CSF' },
};

// CIS Critical Security Controls v8
export const CIS_CONTROLS: Record<string, ComplianceControl> = {
  'CIS-1': { id: 'CIS-1', name: 'Inventory of Enterprise Assets', description: 'Actively manage all enterprise assets', framework: 'CIS Controls' },
  'CIS-2': { id: 'CIS-2', name: 'Inventory of Software Assets', description: 'Actively manage all software on the network', framework: 'CIS Controls' },
  'CIS-3': { id: 'CIS-3', name: 'Data Protection', description: 'Develop processes to identify, classify, and protect data', framework: 'CIS Controls' },
  'CIS-4': { id: 'CIS-4', name: 'Secure Configuration', description: 'Establish and maintain secure configuration of assets', framework: 'CIS Controls' },
  'CIS-5': { id: 'CIS-5', name: 'Account Management', description: 'Use processes and tools to assign and manage authorization', framework: 'CIS Controls' },
  'CIS-6': { id: 'CIS-6', name: 'Access Control Management', description: 'Use processes to create, assign, manage credentials', framework: 'CIS Controls' },
  'CIS-7': { id: 'CIS-7', name: 'Continuous Vulnerability Management', description: 'Continuously identify vulnerabilities and remediate', framework: 'CIS Controls' },
  'CIS-8': { id: 'CIS-8', name: 'Audit Log Management', description: 'Collect, alert, and analyze audit logs', framework: 'CIS Controls' },
  'CIS-9': { id: 'CIS-9', name: 'Email and Web Browser Protections', description: 'Improve protections against email/web threats', framework: 'CIS Controls' },
  'CIS-10': { id: 'CIS-10', name: 'Malware Defenses', description: 'Prevent or control malware installation and execution', framework: 'CIS Controls' },
  'CIS-11': { id: 'CIS-11', name: 'Data Recovery', description: 'Establish and maintain data recovery practices', framework: 'CIS Controls' },
  'CIS-12': { id: 'CIS-12', name: 'Network Infrastructure Management', description: 'Establish and maintain secure network infrastructure', framework: 'CIS Controls' },
  'CIS-13': { id: 'CIS-13', name: 'Network Monitoring and Defense', description: 'Operate processes to monitor and defend network', framework: 'CIS Controls' },
  'CIS-14': { id: 'CIS-14', name: 'Security Awareness Training', description: 'Establish security awareness and skills training', framework: 'CIS Controls' },
  'CIS-15': { id: 'CIS-15', name: 'Service Provider Management', description: 'Develop processes to evaluate service providers', framework: 'CIS Controls' },
  'CIS-16': { id: 'CIS-16', name: 'Application Software Security', description: 'Manage security lifecycle of in-house software', framework: 'CIS Controls' },
  'CIS-17': { id: 'CIS-17', name: 'Incident Response Management', description: 'Establish incident response program', framework: 'CIS Controls' },
  'CIS-18': { id: 'CIS-18', name: 'Penetration Testing', description: 'Test effectiveness of security controls', framework: 'CIS Controls' },
};

// ISO 27001 Controls (Annex A)
export const ISO_27001_CONTROLS: Record<string, ComplianceControl> = {
  'A.5': { id: 'A.5', name: 'Information Security Policies', description: 'Management direction for information security', framework: 'ISO 27001' },
  'A.6': { id: 'A.6', name: 'Organization of Information Security', description: 'Internal organization and mobile/teleworking', framework: 'ISO 27001' },
  'A.7': { id: 'A.7', name: 'Human Resource Security', description: 'Prior to, during, and termination of employment', framework: 'ISO 27001' },
  'A.8': { id: 'A.8', name: 'Asset Management', description: 'Responsibility for assets and classification', framework: 'ISO 27001' },
  'A.9': { id: 'A.9', name: 'Access Control', description: 'Business requirements and user access management', framework: 'ISO 27001' },
  'A.10': { id: 'A.10', name: 'Cryptography', description: 'Cryptographic controls and key management', framework: 'ISO 27001' },
  'A.11': { id: 'A.11', name: 'Physical Security', description: 'Secure areas and equipment', framework: 'ISO 27001' },
  'A.12': { id: 'A.12', name: 'Operations Security', description: 'Operational procedures and malware protection', framework: 'ISO 27001' },
  'A.13': { id: 'A.13', name: 'Communications Security', description: 'Network security and information transfer', framework: 'ISO 27001' },
  'A.14': { id: 'A.14', name: 'System Development Security', description: 'Security in development and support processes', framework: 'ISO 27001' },
  'A.15': { id: 'A.15', name: 'Supplier Relationships', description: 'Information security in supplier relationships', framework: 'ISO 27001' },
  'A.16': { id: 'A.16', name: 'Incident Management', description: 'Management of security incidents', framework: 'ISO 27001' },
  'A.17': { id: 'A.17', name: 'Business Continuity', description: 'Information security aspects of BCM', framework: 'ISO 27001' },
  'A.18': { id: 'A.18', name: 'Compliance', description: 'Compliance with legal and contractual requirements', framework: 'ISO 27001' },
};

// SOC 2 Trust Service Criteria
export const SOC2_CRITERIA: Record<string, ComplianceControl> = {
  'CC1': { id: 'CC1', name: 'Control Environment', description: 'Demonstrates commitment to integrity and ethical values', framework: 'SOC 2' },
  'CC2': { id: 'CC2', name: 'Communication and Information', description: 'Internal and external communication of objectives', framework: 'SOC 2' },
  'CC3': { id: 'CC3', name: 'Risk Assessment', description: 'Risk assessment and fraud risk considerations', framework: 'SOC 2' },
  'CC4': { id: 'CC4', name: 'Monitoring Activities', description: 'Ongoing and separate evaluations of controls', framework: 'SOC 2' },
  'CC5': { id: 'CC5', name: 'Control Activities', description: 'Selection and development of control activities', framework: 'SOC 2' },
  'CC6': { id: 'CC6', name: 'Logical and Physical Access', description: 'Access management and authentication', framework: 'SOC 2' },
  'CC7': { id: 'CC7', name: 'System Operations', description: 'Detection and monitoring of security events', framework: 'SOC 2' },
  'CC8': { id: 'CC8', name: 'Change Management', description: 'Infrastructure and software change controls', framework: 'SOC 2' },
  'CC9': { id: 'CC9', name: 'Risk Mitigation', description: 'Vendor and business partner risk mitigation', framework: 'SOC 2' },
};

// STRIDE to Compliance Framework mapping
const STRIDE_TO_CONTROLS: Record<string, { nist: string[], cis: string[], iso: string[], soc2: string[] }> = {
  'Spoofing': {
    nist: ['PR.AC', 'PR.PT', 'DE.CM'],
    cis: ['CIS-5', 'CIS-6', 'CIS-13'],
    iso: ['A.9', 'A.12'],
    soc2: ['CC6', 'CC7'],
  },
  'Tampering': {
    nist: ['PR.DS', 'PR.IP', 'DE.AE'],
    cis: ['CIS-3', 'CIS-4', 'CIS-16'],
    iso: ['A.12', 'A.14'],
    soc2: ['CC5', 'CC8'],
  },
  'Repudiation': {
    nist: ['PR.PT', 'DE.AE', 'DE.CM'],
    cis: ['CIS-8', 'CIS-13'],
    iso: ['A.12', 'A.16'],
    soc2: ['CC4', 'CC7'],
  },
  'Information Disclosure': {
    nist: ['PR.DS', 'PR.AC', 'PR.PT'],
    cis: ['CIS-3', 'CIS-6', 'CIS-12'],
    iso: ['A.8', 'A.9', 'A.10', 'A.13'],
    soc2: ['CC6', 'CC5'],
  },
  'Denial of Service': {
    nist: ['PR.PT', 'DE.CM', 'RS.MI'],
    cis: ['CIS-4', 'CIS-12', 'CIS-13'],
    iso: ['A.12', 'A.13', 'A.17'],
    soc2: ['CC7', 'CC9'],
  },
  'Elevation of Privilege': {
    nist: ['PR.AC', 'PR.PT', 'DE.CM'],
    cis: ['CIS-5', 'CIS-6', 'CIS-16'],
    iso: ['A.9', 'A.12', 'A.14'],
    soc2: ['CC6', 'CC5'],
  },
};

// OWASP Top 10 mapping
const OWASP_MAPPING: Record<string, ComplianceControl> = {
  'A01:2021': { id: 'A01:2021', name: 'Broken Access Control', description: 'Restrictions on authenticated users not properly enforced', framework: 'OWASP Top 10' },
  'A02:2021': { id: 'A02:2021', name: 'Cryptographic Failures', description: 'Failures related to cryptography leading to data exposure', framework: 'OWASP Top 10' },
  'A03:2021': { id: 'A03:2021', name: 'Injection', description: 'Hostile data sent to interpreter as part of command or query', framework: 'OWASP Top 10' },
  'A04:2021': { id: 'A04:2021', name: 'Insecure Design', description: 'Missing or ineffective control design', framework: 'OWASP Top 10' },
  'A05:2021': { id: 'A05:2021', name: 'Security Misconfiguration', description: 'Missing or improperly configured security hardening', framework: 'OWASP Top 10' },
  'A06:2021': { id: 'A06:2021', name: 'Vulnerable Components', description: 'Using components with known vulnerabilities', framework: 'OWASP Top 10' },
  'A07:2021': { id: 'A07:2021', name: 'Auth Failures', description: 'Identification and authentication failures', framework: 'OWASP Top 10' },
  'A08:2021': { id: 'A08:2021', name: 'Integrity Failures', description: 'Software and data integrity failures', framework: 'OWASP Top 10' },
  'A09:2021': { id: 'A09:2021', name: 'Logging Failures', description: 'Security logging and monitoring failures', framework: 'OWASP Top 10' },
  'A10:2021': { id: 'A10:2021', name: 'SSRF', description: 'Server-Side Request Forgery', framework: 'OWASP Top 10' },
};

/**
 * Get compliance controls for a threat
 */
export function getComplianceControlsForThreat(threat: Threat): ComplianceControl[] {
  const controls: ComplianceControl[] = [];
  
  // Get STRIDE-based controls
  const strideControls = STRIDE_TO_CONTROLS[threat.strideCategory];
  if (strideControls) {
    strideControls.nist.forEach(id => controls.push(NIST_CSF_CONTROLS[id]));
    strideControls.cis.forEach(id => controls.push(CIS_CONTROLS[id]));
    strideControls.iso.forEach(id => controls.push(ISO_27001_CONTROLS[id]));
    strideControls.soc2.forEach(id => controls.push(SOC2_CRITERIA[id]));
  }
  
  // Add OWASP mapping if present
  if (threat.owaspMapping) {
    const owaspKey = threat.owaspMapping.split(' ')[0]; // Get "A03:2021" from "A03:2021 Injection"
    if (OWASP_MAPPING[owaspKey]) {
      controls.push(OWASP_MAPPING[owaspKey]);
    }
  }
  
  return controls.filter(Boolean);
}

/**
 * Calculate compliance coverage for each framework
 */
export function calculateFrameworkCoverage(threats: Threat[]): FrameworkCoverage[] {
  const frameworkCoverage: Record<ComplianceFramework, Set<string>> = {
    'NIST CSF': new Set(),
    'CIS Controls': new Set(),
    'ISO 27001': new Set(),
    'SOC 2': new Set(),
    'OWASP Top 10': new Set(),
  };
  
  // Collect all covered controls
  threats.forEach(threat => {
    const controls = getComplianceControlsForThreat(threat);
    controls.forEach(control => {
      frameworkCoverage[control.framework].add(control.id);
    });
  });
  
  // Calculate coverage percentages
  const totalControls: Record<ComplianceFramework, number> = {
    'NIST CSF': Object.keys(NIST_CSF_CONTROLS).length,
    'CIS Controls': Object.keys(CIS_CONTROLS).length,
    'ISO 27001': Object.keys(ISO_27001_CONTROLS).length,
    'SOC 2': Object.keys(SOC2_CRITERIA).length,
    'OWASP Top 10': Object.keys(OWASP_MAPPING).length,
  };
  
  const allControls: Record<ComplianceFramework, Record<string, ComplianceControl>> = {
    'NIST CSF': NIST_CSF_CONTROLS,
    'CIS Controls': CIS_CONTROLS,
    'ISO 27001': ISO_27001_CONTROLS,
    'SOC 2': SOC2_CRITERIA,
    'OWASP Top 10': OWASP_MAPPING,
  };
  
  return Object.entries(frameworkCoverage).map(([framework, coveredIds]) => {
    const fw = framework as ComplianceFramework;
    const covered = coveredIds.size;
    const total = totalControls[fw];
    const gaps = Object.values(allControls[fw]).filter(control => !coveredIds.has(control.id));
    
    return {
      framework: fw,
      totalControls: total,
      coveredControls: covered,
      coveragePercent: Math.round((covered / total) * 100),
      gaps,
    };
  });
}

/**
 * Get all controls for a specific framework
 */
export function getFrameworkControls(framework: ComplianceFramework): ComplianceControl[] {
  switch (framework) {
    case 'NIST CSF':
      return Object.values(NIST_CSF_CONTROLS);
    case 'CIS Controls':
      return Object.values(CIS_CONTROLS);
    case 'ISO 27001':
      return Object.values(ISO_27001_CONTROLS);
    case 'SOC 2':
      return Object.values(SOC2_CRITERIA);
    case 'OWASP Top 10':
      return Object.values(OWASP_MAPPING);
    default:
      return [];
  }
}
