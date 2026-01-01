import { db } from '@/lib/db';
import { threats } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import ThreatsTable from '@/components/threats-table';
import ExportThreats from '@/components/export-threats';

export default async function ThreatsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Fetch all threats from database
  const allThreats = await db.select().from(threats).orderBy(desc(threats.severity), threats.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Threats</h2>
          <p className="text-muted-foreground">
            Browse and manage {allThreats.length} security threats across STRIDE categories
          </p>
        </div>
        <ExportThreats threats={allThreats} />
      </div>

      <ThreatsTable threats={allThreats} />
    </div>
  );
}
