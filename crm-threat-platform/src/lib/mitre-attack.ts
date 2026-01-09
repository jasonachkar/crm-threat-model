/**
 * MITRE ATT&CK Framework Integration
 * 
 * Maps threats to MITRE ATT&CK tactics and techniques.
 * This is a must-have for serious security professionals and SOC teams.
 */

import { Threat } from '@/lib/db/schema';

// MITRE ATT&CK Tactics (Enterprise Matrix)
export interface AttackTactic {
  id: string;
  name: string;
  shortName: string;
  description: string;
  color: string;
}

export interface AttackTechnique {
  id: string;
  name: string;
  tacticId: string;
  description: string;
  url: string;
}

export interface ThreatAttackMapping {
  threatId: string;
  tactics: AttackTactic[];
  techniques: AttackTechnique[];
}

// MITRE ATT&CK Enterprise Tactics
export const ATTACK_TACTICS: Record<string, AttackTactic> = {
  'TA0001': { id: 'TA0001', name: 'Initial Access', shortName: 'Initial Access', description: 'Techniques to gain initial foothold within a network', color: '#e74c3c' },
  'TA0002': { id: 'TA0002', name: 'Execution', shortName: 'Execution', description: 'Techniques to run malicious code', color: '#e67e22' },
  'TA0003': { id: 'TA0003', name: 'Persistence', shortName: 'Persistence', description: 'Techniques to maintain presence in environment', color: '#f1c40f' },
  'TA0004': { id: 'TA0004', name: 'Privilege Escalation', shortName: 'Priv Esc', description: 'Techniques to gain higher-level permissions', color: '#2ecc71' },
  'TA0005': { id: 'TA0005', name: 'Defense Evasion', shortName: 'Def Evasion', description: 'Techniques to avoid detection', color: '#1abc9c' },
  'TA0006': { id: 'TA0006', name: 'Credential Access', shortName: 'Cred Access', description: 'Techniques to steal account credentials', color: '#3498db' },
  'TA0007': { id: 'TA0007', name: 'Discovery', shortName: 'Discovery', description: 'Techniques to learn about the environment', color: '#9b59b6' },
  'TA0008': { id: 'TA0008', name: 'Lateral Movement', shortName: 'Lateral Move', description: 'Techniques to move through the environment', color: '#34495e' },
  'TA0009': { id: 'TA0009', name: 'Collection', shortName: 'Collection', description: 'Techniques to gather data of interest', color: '#95a5a6' },
  'TA0010': { id: 'TA0010', name: 'Exfiltration', shortName: 'Exfiltration', description: 'Techniques to steal data from the network', color: '#d35400' },
  'TA0011': { id: 'TA0011', name: 'Command and Control', shortName: 'C2', description: 'Techniques for communication with compromised systems', color: '#c0392b' },
  'TA0040': { id: 'TA0040', name: 'Impact', shortName: 'Impact', description: 'Techniques to manipulate, interrupt, or destroy systems', color: '#8e44ad' },
};

// Common ATT&CK Techniques relevant to web/cloud applications
export const ATTACK_TECHNIQUES: Record<string, AttackTechnique> = {
  // Initial Access
  'T1566': { id: 'T1566', name: 'Phishing', tacticId: 'TA0001', description: 'Phishing messages to gain access', url: 'https://attack.mitre.org/techniques/T1566/' },
  'T1078': { id: 'T1078', name: 'Valid Accounts', tacticId: 'TA0001', description: 'Using legitimate credentials', url: 'https://attack.mitre.org/techniques/T1078/' },
  'T1190': { id: 'T1190', name: 'Exploit Public-Facing Application', tacticId: 'TA0001', description: 'Exploiting weaknesses in internet-facing systems', url: 'https://attack.mitre.org/techniques/T1190/' },
  
  // Execution
  'T1059': { id: 'T1059', name: 'Command and Scripting Interpreter', tacticId: 'TA0002', description: 'Executing commands and scripts', url: 'https://attack.mitre.org/techniques/T1059/' },
  'T1203': { id: 'T1203', name: 'Exploitation for Client Execution', tacticId: 'TA0002', description: 'Exploiting client software vulnerabilities', url: 'https://attack.mitre.org/techniques/T1203/' },
  
  // Persistence
  'T1136': { id: 'T1136', name: 'Create Account', tacticId: 'TA0003', description: 'Creating new accounts for persistence', url: 'https://attack.mitre.org/techniques/T1136/' },
  'T1556': { id: 'T1556', name: 'Modify Authentication Process', tacticId: 'TA0003', description: 'Modifying authentication mechanisms', url: 'https://attack.mitre.org/techniques/T1556/' },
  
  // Privilege Escalation
  'T1548': { id: 'T1548', name: 'Abuse Elevation Control Mechanism', tacticId: 'TA0004', description: 'Abusing elevation control mechanisms', url: 'https://attack.mitre.org/techniques/T1548/' },
  'T1068': { id: 'T1068', name: 'Exploitation for Privilege Escalation', tacticId: 'TA0004', description: 'Exploiting vulnerabilities for higher privileges', url: 'https://attack.mitre.org/techniques/T1068/' },
  
  // Defense Evasion
  'T1070': { id: 'T1070', name: 'Indicator Removal', tacticId: 'TA0005', description: 'Deleting or modifying artifacts', url: 'https://attack.mitre.org/techniques/T1070/' },
  'T1562': { id: 'T1562', name: 'Impair Defenses', tacticId: 'TA0005', description: 'Disabling security tools', url: 'https://attack.mitre.org/techniques/T1562/' },
  
  // Credential Access
  'T1110': { id: 'T1110', name: 'Brute Force', tacticId: 'TA0006', description: 'Guessing credentials', url: 'https://attack.mitre.org/techniques/T1110/' },
  'T1539': { id: 'T1539', name: 'Steal Web Session Cookie', tacticId: 'TA0006', description: 'Stealing session cookies', url: 'https://attack.mitre.org/techniques/T1539/' },
  'T1528': { id: 'T1528', name: 'Steal Application Access Token', tacticId: 'TA0006', description: 'Stealing application tokens', url: 'https://attack.mitre.org/techniques/T1528/' },
  'T1552': { id: 'T1552', name: 'Unsecured Credentials', tacticId: 'TA0006', description: 'Finding exposed credentials', url: 'https://attack.mitre.org/techniques/T1552/' },
  
  // Discovery
  'T1087': { id: 'T1087', name: 'Account Discovery', tacticId: 'TA0007', description: 'Enumerating accounts', url: 'https://attack.mitre.org/techniques/T1087/' },
  'T1580': { id: 'T1580', name: 'Cloud Infrastructure Discovery', tacticId: 'TA0007', description: 'Discovering cloud resources', url: 'https://attack.mitre.org/techniques/T1580/' },
  
  // Collection
  'T1530': { id: 'T1530', name: 'Data from Cloud Storage', tacticId: 'TA0009', description: 'Accessing cloud storage objects', url: 'https://attack.mitre.org/techniques/T1530/' },
  'T1213': { id: 'T1213', name: 'Data from Information Repositories', tacticId: 'TA0009', description: 'Collecting data from repositories', url: 'https://attack.mitre.org/techniques/T1213/' },
  
  // Exfiltration
  'T1567': { id: 'T1567', name: 'Exfiltration Over Web Service', tacticId: 'TA0010', description: 'Exfiltrating data over web services', url: 'https://attack.mitre.org/techniques/T1567/' },
  
  // Impact
  'T1485': { id: 'T1485', name: 'Data Destruction', tacticId: 'TA0040', description: 'Destroying data and files', url: 'https://attack.mitre.org/techniques/T1485/' },
  'T1489': { id: 'T1489', name: 'Service Stop', tacticId: 'TA0040', description: 'Stopping or disabling services', url: 'https://attack.mitre.org/techniques/T1489/' },
  'T1499': { id: 'T1499', name: 'Endpoint Denial of Service', tacticId: 'TA0040', description: 'Performing denial of service', url: 'https://attack.mitre.org/techniques/T1499/' },
  
  // Cloud-specific techniques
  'T1537': { id: 'T1537', name: 'Transfer Data to Cloud Account', tacticId: 'TA0010', description: 'Transferring data to cloud accounts', url: 'https://attack.mitre.org/techniques/T1537/' },
  'T1550': { id: 'T1550', name: 'Use Alternate Authentication Material', tacticId: 'TA0008', description: 'Using non-password authentication', url: 'https://attack.mitre.org/techniques/T1550/' },
};

// STRIDE to ATT&CK mapping
const STRIDE_TO_ATTACK: Record<string, { tactics: string[], techniques: string[] }> = {
  'Spoofing': {
    tactics: ['TA0001', 'TA0006'],
    techniques: ['T1078', 'T1566', 'T1539', 'T1528', 'T1556'],
  },
  'Tampering': {
    tactics: ['TA0040', 'TA0002'],
    techniques: ['T1485', 'T1059', 'T1203'],
  },
  'Repudiation': {
    tactics: ['TA0005'],
    techniques: ['T1070', 'T1562'],
  },
  'Information Disclosure': {
    tactics: ['TA0009', 'TA0007', 'TA0010'],
    techniques: ['T1530', 'T1213', 'T1087', 'T1580', 'T1552', 'T1567'],
  },
  'Denial of Service': {
    tactics: ['TA0040'],
    techniques: ['T1499', 'T1489'],
  },
  'Elevation of Privilege': {
    tactics: ['TA0004', 'TA0003'],
    techniques: ['T1548', 'T1068', 'T1136'],
  },
};

// Additional threat-specific technique mappings based on threat patterns
const THREAT_PATTERN_TO_TECHNIQUES: Record<string, string[]> = {
  'xss': ['T1539', 'T1528'],
  'credential': ['T1110', 'T1078'],
  'phishing': ['T1566'],
  'injection': ['T1059', 'T1190'],
  'sql': ['T1190'],
  'session': ['T1539', 'T1550'],
  'ssrf': ['T1190', 'T1580'],
  'cloud': ['T1530', 'T1580', 'T1537'],
  'storage': ['T1530'],
  'bucket': ['T1530'],
  'token': ['T1528', 'T1550'],
  'jwt': ['T1528'],
  'log': ['T1070'],
  'audit': ['T1070', 'T1562'],
  'ddos': ['T1499'],
  'dos': ['T1499'],
  'rbac': ['T1548', 'T1068'],
  'privilege': ['T1068', 'T1548'],
  'admin': ['T1136', 'T1078'],
};

/**
 * Get ATT&CK mapping for a threat
 */
export function getThreatAttackMapping(threat: Threat): ThreatAttackMapping {
  const tactics = new Set<string>();
  const techniques = new Set<string>();
  
  // Get base mappings from STRIDE category
  const strideMapping = STRIDE_TO_ATTACK[threat.strideCategory];
  if (strideMapping) {
    strideMapping.tactics.forEach(t => tactics.add(t));
    strideMapping.techniques.forEach(t => techniques.add(t));
  }
  
  // Add pattern-based techniques by analyzing threat title and scenario
  const searchText = `${threat.title} ${threat.attackScenario}`.toLowerCase();
  Object.entries(THREAT_PATTERN_TO_TECHNIQUES).forEach(([pattern, techs]) => {
    if (searchText.includes(pattern)) {
      techs.forEach(t => techniques.add(t));
      // Add corresponding tactics
      techs.forEach(t => {
        const technique = ATTACK_TECHNIQUES[t];
        if (technique) {
          tactics.add(technique.tacticId);
        }
      });
    }
  });
  
  return {
    threatId: threat.id,
    tactics: Array.from(tactics).map(id => ATTACK_TACTICS[id]).filter(Boolean),
    techniques: Array.from(techniques).map(id => ATTACK_TECHNIQUES[id]).filter(Boolean),
  };
}

/**
 * Get attack coverage statistics
 */
export function getAttackCoverage(threats: Threat[]): {
  tacticsCount: Record<string, number>;
  techniquesCount: Record<string, number>;
  totalTacticsCovered: number;
  totalTechniquesCovered: number;
} {
  const tacticsCount: Record<string, number> = {};
  const techniquesCount: Record<string, number> = {};
  const tacticsCovered = new Set<string>();
  const techniquesCovered = new Set<string>();
  
  threats.forEach(threat => {
    const mapping = getThreatAttackMapping(threat);
    
    mapping.tactics.forEach(tactic => {
      tacticsCount[tactic.id] = (tacticsCount[tactic.id] || 0) + 1;
      tacticsCovered.add(tactic.id);
    });
    
    mapping.techniques.forEach(technique => {
      techniquesCount[technique.id] = (techniquesCount[technique.id] || 0) + 1;
      techniquesCovered.add(technique.id);
    });
  });
  
  return {
    tacticsCount,
    techniquesCount,
    totalTacticsCovered: tacticsCovered.size,
    totalTechniquesCovered: techniquesCovered.size,
  };
}

/**
 * Get all tactics in order (for matrix display)
 */
export function getAllTactics(): AttackTactic[] {
  return [
    ATTACK_TACTICS['TA0001'],
    ATTACK_TACTICS['TA0002'],
    ATTACK_TACTICS['TA0003'],
    ATTACK_TACTICS['TA0004'],
    ATTACK_TACTICS['TA0005'],
    ATTACK_TACTICS['TA0006'],
    ATTACK_TACTICS['TA0007'],
    ATTACK_TACTICS['TA0008'],
    ATTACK_TACTICS['TA0009'],
    ATTACK_TACTICS['TA0010'],
    ATTACK_TACTICS['TA0011'],
    ATTACK_TACTICS['TA0040'],
  ];
}

/**
 * Get techniques for a specific tactic
 */
export function getTechniquesForTactic(tacticId: string): AttackTechnique[] {
  return Object.values(ATTACK_TECHNIQUES).filter(t => t.tacticId === tacticId);
}
