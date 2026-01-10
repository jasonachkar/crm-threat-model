import { db } from '@/lib/db';
import { threats } from '@/lib/db/schema';
import MitreAttackMatrix from '@/components/mitre-attack-matrix';

export const dynamic = 'force-dynamic';

export default async function AttackMatrixPage() {
  const allThreats = await db.select().from(threats);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">MITRE ATT&CK Mapping</h2>
        <p className="text-muted-foreground">
          Threat coverage mapped to MITRE ATT&CK Enterprise tactics and techniques
        </p>
      </div>

      <MitreAttackMatrix threats={allThreats} />
    </div>
  );
}
