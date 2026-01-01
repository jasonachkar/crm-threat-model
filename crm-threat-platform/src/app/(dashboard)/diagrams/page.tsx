import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';

export default function DiagramsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Architecture Diagrams</h2>
        <p className="text-muted-foreground">
          Visual representations of the CRM system architecture and threat landscape
        </p>
      </div>

      <Tabs defaultValue="dfd" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dfd">Data Flow Diagram</TabsTrigger>
          <TabsTrigger value="trust">Trust Boundaries</TabsTrigger>
          <TabsTrigger value="auth">Authentication Sequence</TabsTrigger>
        </TabsList>

        <TabsContent value="dfd">
          <Card>
            <CardHeader>
              <CardTitle>Data Flow Diagram (DFD)</CardTitle>
              <CardDescription>
                Shows how data flows through the CRM system, including external entities, processes, data stores, and data flows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border bg-white p-4">
                <img
                  src="/diagrams/dfd.svg"
                  alt="Data Flow Diagram"
                  className="w-full h-auto"
                />
              </div>
              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-sm">Key Components:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>External entities: End Users, Tenant Admins, Third-party Services</li>
                  <li>Core processes: Authentication, API Gateway, Business Logic, Background Jobs</li>
                  <li>Data stores: PostgreSQL (multi-tenant), Object Storage, Message Queue</li>
                  <li>Critical flows: User authentication, API requests, file uploads, async processing</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trust">
          <Card>
            <CardHeader>
              <CardTitle>Trust Boundaries</CardTitle>
              <CardDescription>
                Illustrates security boundaries and trust zones within the CRM architecture
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border bg-white p-4">
                <img
                  src="/diagrams/trust-boundaries.svg"
                  alt="Trust Boundaries Diagram"
                  className="w-full h-auto"
                />
              </div>
              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-sm">Trust Zones:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li><strong>Untrusted Zone:</strong> Internet, external users, third-party APIs</li>
                  <li><strong>DMZ:</strong> Web application firewall, load balancer, API gateway</li>
                  <li><strong>Application Zone:</strong> Web servers, application logic, background workers</li>
                  <li><strong>Data Zone:</strong> Database servers, object storage (most trusted)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auth">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Sequence Diagram</CardTitle>
              <CardDescription>
                Detailed flow of the authentication process including JWT token issuance and validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border bg-white p-4">
                <img
                  src="/diagrams/auth-sequence.svg"
                  alt="Authentication Sequence Diagram"
                  className="w-full h-auto"
                />
              </div>
              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-sm">Authentication Flow:</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>User submits credentials to web client</li>
                  <li>Client sends login request to API Gateway</li>
                  <li>API Gateway forwards to Identity Provider</li>
                  <li>Identity Provider validates credentials against user database</li>
                  <li>JWT access token and refresh token generated</li>
                  <li>Tokens returned to client and stored securely</li>
                  <li>Subsequent requests include JWT in Authorization header</li>
                  <li>API validates JWT on each request</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Threat Context */}
      <Card>
        <CardHeader>
          <CardTitle>Related Threats</CardTitle>
          <CardDescription>Key security threats mapped to these diagrams</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-2">Authentication & Authorization:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>TM-001: JWT Token Theft via XSS</li>
                <li>TM-002: Credential Stuffing Attack on Login</li>
                <li>TM-004: Session Fixation Attack</li>
                <li>TM-032: Privilege Escalation via RBAC Misconfiguration</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-2">Data Flow & Boundaries:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>TM-017: BOLA - Cross-Tenant Data Access (Critical)</li>
                <li>TM-007: SQL Injection via Unsanitized Input</li>
                <li>TM-019: Object Storage Bucket Misconfiguration</li>
                <li>TM-033: SSRF via Import from URL Feature</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
