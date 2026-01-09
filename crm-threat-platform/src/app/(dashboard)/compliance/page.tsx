import { db } from '@/lib/db';
import { threats } from '@/lib/db/schema';
import ComplianceDashboard from '@/components/compliance-dashboard';

export const dynamic = 'force-dynamic';

export default async function CompliancePage() {
  const allThreats = await db.select().from(threats);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Compliance Mapping</h2>
        <p className="text-muted-foreground">
          Framework coverage across NIST CSF, CIS Controls, ISO 27001, SOC 2, and OWASP Top 10
        </p>
      </div>

      <ComplianceDashboard threats={allThreats} />
    </div>
  );
}
