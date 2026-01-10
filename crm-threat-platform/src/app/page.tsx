import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const architectureDiagrams = [
  {
    title: "Trust Boundaries",
    description: "Tenant isolation boundaries and service trust zones.",
    href: "/diagrams/trust-boundaries.svg",
  },
  {
    title: "Data Flow Diagram",
    description: "Cloud data ingress, processing, and egress controls.",
    href: "/diagrams/dfd.svg",
  },
  {
    title: "Auth Sequence",
    description: "Zero-trust authentication and brokered access flow.",
    href: "/diagrams/auth-sequence.svg",
  },
];

const standardsMapping = [
  {
    threat: "Cross-tenant data exposure",
    mitigation: "Dedicated tenant vaults, scoped IAM, and workload identity.",
    standards: ["CIS 1.7", "NIST AC-3", "NIST SC-7"],
  },
  {
    threat: "Misconfigured cloud storage",
    mitigation: "Continuous posture checks with guardrails + drift alerts.",
    standards: ["CIS 2.1", "NIST CM-6", "NIST AU-6"],
  },
  {
    threat: "Privilege escalation",
    mitigation: "Just-in-time access and policy simulation pre-deploy.",
    standards: ["CIS 1.4", "NIST AC-6", "NIST RA-5"],
  },
];

const guidedTourSteps = [
  "Start with the tenant map to validate isolation paths.",
  "Open the control coverage panel for CSPM gaps.",
  "Review measurable outcomes tied to risk reduction KPIs.",
];

export default function MarketingPage() {
  return (
    <main className="bg-background text-foreground">
      <section className="relative overflow-hidden border-b">
        <div className="container mx-auto px-6 py-16 md:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-muted-foreground">
                Cloud Threat Modeling Platform
                <Badge variant="secondary">Recruiter Ready</Badge>
              </div>
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                Cloud threat modeling with tenant isolation, posture management,
                and measurable outcomes.
              </h1>
              <p className="text-lg text-muted-foreground">
                CRM Threat Management Platform delivers a unified cloud security
                story: isolate tenants, map threats to mitigations, and quantify
                risk reduction across your cloud control plane.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="#demo-mode">Explore Recruiter Demo</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="#control-coverage">View Cloud Control Coverage</Link>
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>42%</CardTitle>
                    <CardDescription>Faster threat triage</CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>96%</CardTitle>
                    <CardDescription>Cloud control coverage</CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>18 hrs</CardTitle>
                    <CardDescription>Average mitigation turn-around</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
              <CardHeader>
                <CardTitle>Cloud posture at a glance</CardTitle>
                <CardDescription>
                  Live tenant scoring, isolation coverage, and open risks per
                  environment.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border bg-background/80 p-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Tenant isolation score</span>
                    <span className="font-medium text-foreground">98%</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-muted">
                    <div className="h-2 w-[98%] rounded-full bg-primary" />
                  </div>
                </div>
                <div className="rounded-lg border bg-background/80 p-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Posture drift alerts</span>
                    <span className="font-medium text-foreground">3 open</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="outline">S3 public access</Badge>
                    <Badge variant="outline">KMS key rotation</Badge>
                    <Badge variant="outline">IAM wildcard</Badge>
                  </div>
                </div>
                <div className="rounded-lg border bg-background/80 p-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Risk reduction this quarter</span>
                    <span className="font-medium text-foreground">-27%</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Automated mitigation workflows cut mean time to resolution.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="demo-mode" className="border-b bg-muted/20">
        <div className="container mx-auto px-6 py-16">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold">Recruiter Demo Mode</h2>
              <p className="text-muted-foreground">
                Toggle a curated, read-only experience that highlights sample
                tenant data, diagrams, and a guided tour of cloud threat
                workflows.
              </p>
              <div className="flex items-center gap-3 rounded-lg border bg-background p-4">
                <input
                  type="checkbox"
                  checked
                  disabled
                  className="h-4 w-4 accent-primary"
                  aria-label="Recruiter demo mode enabled"
                />
                <div>
                  <p className="text-sm font-medium">Recruiter Demo Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Read-only. Displays vetted sample data and guided tour steps.
                  </p>
                </div>
                <Badge className="ml-auto" variant="secondary">
                  Enabled
                </Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Sample Tenant: Atlas</CardTitle>
                    <CardDescription>6 workloads, 14 mitigations</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Diagrams annotated with tenant isolation controls.
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Sample Tenant: Horizon</CardTitle>
                    <CardDescription>3 open risks, 21 controls mapped</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    CSPM posture snapshot with remediation timelines.
                  </CardContent>
                </Card>
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Guided tour</CardTitle>
                <CardDescription>
                  A short walkthrough recruiters can follow in under 3 minutes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ol className="list-decimal space-y-2 pl-4 text-sm text-muted-foreground">
                  {guidedTourSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <Button variant="outline" asChild className="w-full">
                  <Link href="#architecture">Jump to architecture diagrams</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="control-coverage" className="border-b">
        <div className="container mx-auto px-6 py-16">
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-semibold">Cloud control coverage</h2>
              <p className="text-muted-foreground">
                Coverage metrics connect cloud controls to measurable risk
                outcomes, giving recruiters a quick view of impact.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Identity & Access",
                  coverage: "97%",
                  note: "JIT access, scoped IAM, MFA enforcement.",
                },
                {
                  title: "Network Segmentation",
                  coverage: "94%",
                  note: "Zero-trust paths, private endpoints, WAF coverage.",
                },
                {
                  title: "Data Protection",
                  coverage: "98%",
                  note: "KMS lifecycle, encryption-at-rest, DLP sensors.",
                },
              ].map((item) => (
                <Card key={item.title}>
                  <CardHeader>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>{item.coverage} coverage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: item.coverage }}
                      />
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {item.note}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b bg-muted/20">
        <div className="container mx-auto px-6 py-16">
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-semibold">Threats mapped to standards</h2>
              <p className="text-muted-foreground">
                Quickly correlate high-risk threats to CIS Benchmarks and NIST
                800-53 controls with quick-read badges.
              </p>
            </div>
            <div className="grid gap-4">
              {standardsMapping.map((item) => (
                <Card key={item.threat}>
                  <CardContent className="grid gap-3 p-6 md:grid-cols-[1.1fr_1.3fr_0.9fr]">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">
                        Threat
                      </p>
                      <p className="text-lg font-medium">{item.threat}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">
                        Mitigation
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.mitigation}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">
                        Standards
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.standards.map((standard) => (
                          <Badge key={standard} variant="outline">
                            {standard}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="architecture" className="border-b">
        <div className="container mx-auto px-6 py-16">
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-semibold">Architecture diagrams</h2>
              <p className="text-muted-foreground">
                Explore cloud architecture diagrams that highlight trust
                boundaries, data flows, and control coverage.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {architectureDiagrams.map((diagram) => (
                <Card key={diagram.title} className="flex h-full flex-col">
                  <CardHeader>
                    <CardTitle>{diagram.title}</CardTitle>
                    <CardDescription>{diagram.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <Button asChild variant="outline" className="w-full">
                      <Link href={diagram.href} target="_blank" rel="noreferrer">
                        View diagram
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary/5">
        <div className="container mx-auto px-6 py-16">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold">
                Tell a complete cloud security story
              </h2>
              <p className="text-muted-foreground">
                From tenant isolation to posture management, recruiters can see
                the full lifecycle of cloud threat modeling and the outcomes that
                matter.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/dashboard">Enter Dashboard</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/docs">View Documentation</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
