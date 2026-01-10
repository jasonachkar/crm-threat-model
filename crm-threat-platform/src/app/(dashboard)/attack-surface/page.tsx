import { db } from '@/lib/db';
import { threats } from '@/lib/db/schema';
import AttackSurface from '@/components/attack-surface';

export const dynamic = 'force-dynamic';

export default async function AttackSurfacePage() {
  const allThreats = await db.select().from(threats);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Attack Surface Analysis</h2>
        <p className="text-muted-foreground">
          Component-level risk exposure and ownership distribution
        </p>
      </div>

      <AttackSurface threats={allThreats} />
    </div>
  );
}
