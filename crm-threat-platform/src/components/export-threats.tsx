'use client';

import { Threat } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ExportThreatsProps {
  threats: Threat[];
}

export default function ExportThreats({ threats }: ExportThreatsProps) {
  const exportToCSV = () => {
    // CSV headers
    const headers = [
      'ID',
      'STRIDE Category',
      'Title',
      'Components',
      'Asset',
      'Scenario',
      'Impact (C)',
      'Impact (I)',
      'Impact (A)',
      'Likelihood',
      'Severity',
      'OWASP',
      'Priority',
      'Owner',
      'Status',
    ];

    // Convert threats to CSV rows
    const rows = threats.map(threat => [
      threat.id,
      threat.strideCategory,
      `"${threat.title.replace(/"/g, '""')}"`, // Escape quotes
      `"${threat.affectedComponents.replace(/"/g, '""')}"`,
      `"${threat.asset.replace(/"/g, '""')}"`,
      `"${threat.attackScenario.replace(/"/g, '""')}"`,
      threat.impactConfidentiality,
      threat.impactIntegrity,
      threat.impactAvailability,
      threat.likelihood,
      threat.severity,
      threat.owaspMapping || '',
      threat.priority,
      threat.owner,
      threat.status,
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `threats-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button onClick={exportToCSV} variant="outline">
      <Download className="mr-2 h-4 w-4" />
      Export to CSV
    </Button>
  );
}
