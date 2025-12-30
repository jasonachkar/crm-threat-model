# CRM Threat Model - Multi-Tenant SaaS Application

**Professional threat model deliverable using STRIDE methodology**

## Overview

This repository contains a comprehensive threat model for a multi-tenant CRM web application. This deliverable represents consulting-grade security analysis suitable for enterprise risk assessment, security architecture review, and secure development lifecycle integration.

The threat model uses **STRIDE** (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) to systematically identify security threats across a modern SaaS architecture including web clients, REST APIs, microservices, data stores, message queues, and third-party integrations.

**Key Focus**: Multi-tenant isolation and security controls to prevent cross-tenant data breaches.

## What's Inside

This threat model provides:

- **Executive Summary** - Non-technical overview for leadership
- **Technical Summary** - Architecture and risk overview for engineering teams
- **System Architecture** - Detailed component descriptions and data flows
- **Assumptions & Scope** - Explicit boundaries, data classifications, and threat actors
- **Data Flow Diagrams** - Visual representation of system components, trust boundaries, and data flows (PlantUML + exported SVG)
- **Trust Boundary Analysis** - Security implications at each boundary crossing
- **STRIDE Threat Analysis** - 30+ identified threats with attack scenarios, impacts, mitigations, and ownership
- **Security Requirements Checklist** - Actionable controls for development and operations teams
- **Mitigation Roadmap** - Prioritized remediation plan (P0/P1/P2)
- **Threat Tables** - Machine-readable CSV and human-readable Markdown formats

## Repository Structure

```
crm-threat-model/
├── README.md                          # This file
├── LICENSE                            # MIT License
├── docs/                              # Documentation
│   ├── 00-executive-summary.md        # Leadership-level summary
│   ├── 01-system-overview.md          # System architecture overview
│   ├── 02-assumptions-and-scope.md    # Scope boundaries and assumptions
│   ├── 03-architecture-and-dfd.md     # Detailed architecture and data flows
│   ├── 04-trust-boundaries.md         # Trust boundary analysis
│   ├── 05-threats-stride.md           # STRIDE threat analysis
│   ├── 06-security-requirements-checklist.md  # Security controls checklist
│   ├── 07-mitigations-roadmap.md      # Prioritized remediation roadmap
│   └── 08-appendix.md                 # References and additional resources
├── diagrams/                          # Architecture diagrams
│   ├── dfd.puml                       # Data Flow Diagram (PlantUML)
│   ├── trust-boundaries.puml          # Trust boundaries diagram (PlantUML)
│   ├── auth-sequence.puml             # Authentication sequence (PlantUML)
│   └── exports/                       # Generated diagram images
│       ├── dfd.svg
│       ├── trust-boundaries.svg
│       └── auth-sequence.svg
├── tables/                            # Structured threat data
│   ├── threats.csv                    # Machine-readable threats
│   ├── threats.md                     # Human-readable threats table
│   ├── data-classification.md         # Data sensitivity classification
│   └── assets-and-actors.md           # System assets and threat actors
└── templates/                         # Reusable templates
    ├── threat-entry-template.md       # Template for documenting new threats
    └── security-requirements-template.md  # Template for security requirements
```

## How to Use This Threat Model

### For Security Teams

1. **Review the threat inventory** in [docs/05-threats-stride.md](docs/05-threats-stride.md) and [tables/threats.md](tables/threats.md)
2. **Validate assumptions** in [docs/02-assumptions-and-scope.md](docs/02-assumptions-and-scope.md)
3. **Prioritize mitigations** using [docs/07-mitigations-roadmap.md](docs/07-mitigations-roadmap.md)
4. **Track implementation** using the security requirements checklist
5. **Update regularly** as architecture evolves

### For Development Teams

1. **Review security requirements** in [docs/06-security-requirements-checklist.md](docs/06-security-requirements-checklist.md)
2. **Understand data flows** via diagrams in [diagrams/exports/](diagrams/exports/)
3. **Implement mitigations** for threats affecting your components
4. **Validate tenant isolation** controls before deploying features
5. **Add security testing** based on identified threats

### For Leadership

1. **Read executive summary** in [docs/00-executive-summary.md](docs/00-executive-summary.md)
2. **Review risk posture** and mitigation roadmap
3. **Allocate resources** based on priority levels (P0/P1/P2)
4. **Track progress** against security requirements checklist

### For Auditors/Compliance

1. **Review threat coverage** across STRIDE categories
2. **Validate controls** against requirements checklist
3. **Assess residual risk** for each identified threat
4. **Reference OWASP mappings** in threat tables

## Viewing Diagrams

### Pre-generated SVG Files

All diagrams are pre-exported to SVG format in the `diagrams/exports/` directory. You can view them:

- **In GitHub**: Click on the SVG files directly - GitHub renders them inline
- **Locally**: Open SVG files in any modern web browser
- **In Documentation**: SVG files are embedded in the relevant markdown documents

### Available Diagrams

- [Data Flow Diagram (DFD)](diagrams/exports/dfd.svg) - Shows all system components, data flows, and trust boundaries
- [Trust Boundaries](diagrams/exports/trust-boundaries.svg) - Highlights security zones and boundary controls
- [Authentication Sequence](diagrams/exports/auth-sequence.svg) - Details the OIDC login and token flow

## Regenerating Diagrams

If you modify the PlantUML source files, regenerate the SVG exports:

### Using Docker (Recommended)

```bash
# Generate all diagrams
docker run --rm -v $(pwd)/crm-threat-model/diagrams:/data plantuml/plantuml:latest \
  -tsvg -o exports /data/*.puml

# Generate a specific diagram
docker run --rm -v $(pwd)/crm-threat-model/diagrams:/data plantuml/plantuml:latest \
  -tsvg -o exports /data/dfd.puml
```

### Using PlantUML JAR

```bash
# Download PlantUML (if not already installed)
# curl -L -o plantuml.jar https://github.com/plantuml/plantuml/releases/download/v1.2024.3/plantuml-1.2024.3.jar

# Generate all diagrams
cd crm-threat-model/diagrams
java -jar plantuml.jar -tsvg -o exports *.puml
```

### Using VS Code Extension

1. Install the **PlantUML** extension
2. Open any `.puml` file
3. Press `Alt+D` to preview
4. Right-click → "Export Current Diagram" → Choose SVG format

## Threat Model Maintenance

This threat model should be treated as a living document:

### When to Update

- **Architecture changes**: New components, services, or integrations
- **New features**: Additional data types, user roles, or workflows
- **Security incidents**: New attack vectors discovered
- **Technology changes**: Framework upgrades, cloud service changes
- **Compliance requirements**: New regulatory obligations
- **Regular review**: Quarterly or bi-annual security architecture review

### Update Process

1. **Document change**: Update relevant sections in `docs/`
2. **Identify new threats**: Add to threat tables using the template
3. **Update diagrams**: Modify PlantUML files and regenerate exports
4. **Review mitigations**: Update roadmap priorities
5. **Communicate changes**: Brief security and development teams

### Version Control

- Use semantic versioning for major updates (v1.0, v2.0)
- Tag releases when shared with stakeholders
- Maintain a CHANGELOG.md for tracking updates (recommended)

## Threat Severity Model

This threat model uses a **High / Medium / Low** severity scale based on:

- **Impact**: Confidentiality, Integrity, Availability consequences
- **Likelihood**: Ease of exploitation, attacker motivation, existing controls
- **Affected Asset**: Sensitivity of data or criticality of component

**Severity Definitions**:

- **High**: Significant business impact, likely exploitation, affects critical assets (e.g., cross-tenant data breach)
- **Medium**: Moderate impact or lower likelihood, affects important but not critical assets
- **Low**: Limited impact, difficult to exploit, or minimal business consequence

## Key Security Principles

This threat model is built around these core principles:

1. **Defense in Depth**: Multiple layers of security controls
2. **Least Privilege**: Minimal access rights for users, services, and processes
3. **Zero Trust**: Never trust, always verify - especially across tenant boundaries
4. **Secure by Default**: Security controls enabled out of the box
5. **Fail Securely**: Graceful degradation without exposing data or access
6. **Complete Mediation**: Every access request is checked
7. **Tenant Isolation**: Strict separation of tenant data and resources

## Contributing

This threat model was created as a professional deliverable. If you're using this as a template:

1. Fork this repository
2. Customize for your specific architecture
3. Update threat scenarios based on your technology stack
4. Adjust severity ratings for your risk appetite
5. Add organization-specific requirements and compliance controls

## References

- **STRIDE Methodology**: Microsoft Threat Modeling
- **OWASP Top 10 (Web)**: https://owasp.org/www-project-top-ten/
- **OWASP API Security Top 10**: https://owasp.org/www-project-api-security/
- **NIST Cybersecurity Framework**: https://www.nist.gov/cyberframework
- **MITRE ATT&CK**: https://attack.mitre.org/
- **Cloud Security Alliance (CSA)**: Cloud Controls Matrix

## License

MIT License - See [LICENSE](LICENSE) file for details.

---

**Document Classification**: Internal Use
**Last Updated**: 2025-12-29
**Version**: 1.0
**Owner**: Security Architecture Team
