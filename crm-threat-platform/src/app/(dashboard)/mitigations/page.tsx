import { db } from '@/lib/db';
import { auditLog, mitigations } from '@/lib/db/schema';
import { asc, desc, eq } from 'drizzle-orm';
import MitigationsManager from '@/components/mitigations-manager';

export default async function MitigationsPage() {
  const mitigationRows = await db
    .select()
    .from(mitigations)
    .orderBy(asc(mitigations.priority), asc(mitigations.createdAt));

  const recentChanges = await db
    .select()
    .from(auditLog)
    .where(eq(auditLog.entityType, 'mitigation'))
    .orderBy(desc(auditLog.createdAt))
    .limit(6);

  const mitigationsData = mitigationRows.map((mitigation) => ({
    ...mitigation,
    threatRefs: mitigation.threatRefs ?? [],
    targetDate: mitigation.targetDate ? mitigation.targetDate.toISOString() : null,
    completionDate: mitigation.completionDate ? mitigation.completionDate.toISOString() : null,
    createdAt: mitigation.createdAt.toISOString(),
    updatedAt: mitigation.updatedAt.toISOString(),
  }));

  const recentChangesData = recentChanges.map((entry) => ({
    id: entry.id,
    action: entry.action,
    entityId: entry.entityId,
    createdAt: entry.createdAt.toISOString(),
    changes: entry.changes,
  }));

  return <MitigationsManager mitigations={mitigationsData} recentChanges={recentChangesData} />;
}
