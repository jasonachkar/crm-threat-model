import { db } from '@/lib/db';
import { auditLog, requirements } from '@/lib/db/schema';
import { asc, desc, eq } from 'drizzle-orm';
import RequirementsManager from '@/components/requirements-manager';

export default async function RequirementsPage() {
  const requirementRows = await db
    .select()
    .from(requirements)
    .orderBy(asc(requirements.section), asc(requirements.createdAt));

  const recentChanges = await db
    .select()
    .from(auditLog)
    .where(eq(auditLog.entityType, 'requirement'))
    .orderBy(desc(auditLog.createdAt))
    .limit(6);

  const requirementsData = requirementRows.map((req) => ({
    ...req,
    threatRefs: req.threatRefs ?? [],
    createdAt: req.createdAt.toISOString(),
    updatedAt: req.updatedAt.toISOString(),
  }));

  const recentChangesData = recentChanges.map((entry) => ({
    id: entry.id,
    action: entry.action,
    entityId: entry.entityId,
    createdAt: entry.createdAt.toISOString(),
    changes: entry.changes,
  }));

  return <RequirementsManager requirements={requirementsData} recentChanges={recentChangesData} />;
}
