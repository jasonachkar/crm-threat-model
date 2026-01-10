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
  const getParam = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;
  const strideParam = getParam(searchParams.stride);
  const severityParam = getParam(searchParams.severity);
  const priorityParam = getParam(searchParams.priority);
  const statusParam = getParam(searchParams.status);
  const queryParam = getParam(searchParams.query);
  const strideOptions = [
    'Spoofing',
    'Tampering',
    'Repudiation',
    'Information Disclosure',
    'Denial of Service',
    'Elevation of Privilege',
  ];
  const severityOptions = ['LOW', 'MEDIUM', 'HIGH'];
  const priorityOptions = ['P0', 'P1', 'P2'];
  const statusOptions = ['Open', 'In Progress', 'Mitigated', 'Accepted Risk', 'Closed'];

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

      <ThreatsTable
        threats={allThreats}
        initialFilters={{
          query: queryParam,
          stride: strideOptions.includes(strideParam ?? '') ? strideParam : undefined,
          severity: severityOptions.includes(severityParam ?? '') ? severityParam : undefined,
          priority: priorityOptions.includes(priorityParam ?? '') ? priorityParam : undefined,
          status: statusOptions.includes(statusParam ?? '') ? statusParam : undefined,
        }}
      />
    </div>
  );
}
