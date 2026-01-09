'use client';

import { Threat } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, 
  DialogTitle, DialogTrigger, DialogFooter 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { calculateSecurityMetrics } from '@/lib/security-metrics';
import { calculateRiskMetrics, calculateAllRiskScores } from '@/lib/risk-scoring';
import { calculateFrameworkCoverage } from '@/lib/compliance-mapping';
import { FileText, Download, FileJson, Table, BarChart3 } from 'lucide-react';
import { useState } from 'react';

interface ExportReportProps {
  threats: Threat[];
}

export default function ExportReport({ threats }: ExportReportProps) {
  const [includeMetrics, setIncludeMetrics] = useState(true);
  const [includeCompliance, setIncludeCompliance] = useState(true);
  const [includeRiskScores, setIncludeRiskScores] = useState(true);
  
  const metrics = calculateSecurityMetrics(threats);
  const riskMetrics = calculateRiskMetrics(threats);
  const frameworkCoverage = calculateFrameworkCoverage(threats);
  const riskScores = calculateAllRiskScores(threats);

  // Export as CSV with risk scores
  const exportToCSV = () => {
    const headers = [
      'ID', 'Title', 'STRIDE Category', 'Components', 'Severity', 'Priority', 
      'Status', 'Risk Score', 'Risk Level', 'Likelihood', 'Impact (C)', 
      'Impact (I)', 'Impact (A)', 'OWASP Mapping', 'Owner'
    ];
    
    const rows = threats.map(threat => {
      const score = riskScores.get(threat.id)!;
      return [
        threat.id,
        `"${threat.title.replace(/"/g, '""')}"`,
        threat.strideCategory,
        `"${threat.affectedComponents.replace(/"/g, '""')}"`,
        threat.severity,
        threat.priority,
        threat.status,
        score.overall,
        score.riskLevel,
        threat.likelihood,
        threat.impactConfidentiality,
        threat.impactIntegrity,
        threat.impactAvailability,
        threat.owaspMapping || '',
        threat.owner,
      ];
    });
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile(csvContent, 'threat-report.csv', 'text/csv');
  };

  // Export as JSON with full data
  const exportToJSON = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalThreats: threats.length,
        metrics: includeMetrics ? metrics : undefined,
        riskMetrics: includeRiskScores ? riskMetrics : undefined,
        complianceCoverage: includeCompliance ? frameworkCoverage.map(fc => ({
          framework: fc.framework,
          coveragePercent: fc.coveragePercent,
          covered: fc.coveredControls,
          total: fc.totalControls,
        })) : undefined,
      },
      threats: threats.map(threat => ({
        ...threat,
        riskScore: includeRiskScores ? riskScores.get(threat.id) : undefined,
      })),
    };
    
    const jsonContent = JSON.stringify(reportData, null, 2);
    downloadFile(jsonContent, 'threat-report.json', 'application/json');
  };

  // Export as HTML executive report
  const exportToHTML = () => {
    const overallScore = Math.round(
      ((metrics.slaComplianceRate * 0.3) +
      (metrics.riskReductionProgress * 0.3) +
      (metrics.mitigationCoverage * 0.2) +
      ((100 - (riskMetrics.averageRiskScore * 10)) * 0.2))
    );
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Threat Management Executive Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.5; color: #1f2937; padding: 40px; max-width: 1200px; margin: 0 auto; }
    h1 { font-size: 28px; margin-bottom: 8px; color: #111827; }
    h2 { font-size: 20px; margin: 32px 0 16px; color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
    h3 { font-size: 16px; margin: 16px 0 8px; color: #4b5563; }
    .subtitle { color: #6b7280; margin-bottom: 32px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
    .stat-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; }
    .stat-value { font-size: 32px; font-weight: bold; }
    .stat-label { font-size: 14px; color: #6b7280; margin-top: 4px; }
    .critical { color: #dc2626; }
    .high { color: #ea580c; }
    .medium { color: #ca8a04; }
    .low { color: #16a34a; }
    .table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    .table th { background: #f3f4f6; font-weight: 600; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 12px; font-weight: 500; }
    .badge-red { background: #fef2f2; color: #dc2626; }
    .badge-orange { background: #fff7ed; color: #ea580c; }
    .badge-yellow { background: #fefce8; color: #ca8a04; }
    .badge-green { background: #f0fdf4; color: #16a34a; }
    .badge-blue { background: #eff6ff; color: #2563eb; }
    .progress-bar { height: 8px; background: #e5e7eb; border-radius: 9999px; overflow: hidden; margin-top: 8px; }
    .progress-fill { height: 100%; border-radius: 9999px; }
    .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; text-align: center; }
    @media print { body { padding: 20px; } .stats-grid { grid-template-columns: repeat(2, 1fr); } }
  </style>
</head>
<body>
  <h1>🛡️ Threat Management Executive Report</h1>
  <p class="subtitle">Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
  
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-value">${overallScore}</div>
      <div class="stat-label">Security Posture Score (0-100)</div>
    </div>
    <div class="stat-card">
      <div class="stat-value critical">${riskMetrics.totalRiskExposure}</div>
      <div class="stat-label">Total Risk Exposure</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${metrics.slaComplianceRate}%</div>
      <div class="stat-label">SLA Compliance Rate</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${metrics.riskReductionProgress}%</div>
      <div class="stat-label">Risk Reduction Progress</div>
    </div>
  </div>

  <h2>📊 Threat Summary</h2>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-value">${metrics.totalThreats}</div>
      <div class="stat-label">Total Threats</div>
    </div>
    <div class="stat-card">
      <div class="stat-value critical">${metrics.openThreats}</div>
      <div class="stat-label">Open Threats</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" style="color: #2563eb;">${metrics.inProgressThreats}</div>
      <div class="stat-label">In Progress</div>
    </div>
    <div class="stat-card">
      <div class="stat-value low">${metrics.mitigatedThreats}</div>
      <div class="stat-label">Mitigated</div>
    </div>
  </div>

  <h2>⚠️ Risk Distribution</h2>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-value critical">${riskMetrics.criticalCount}</div>
      <div class="stat-label">Critical Risk</div>
    </div>
    <div class="stat-card">
      <div class="stat-value high">${riskMetrics.highCount}</div>
      <div class="stat-label">High Risk</div>
    </div>
    <div class="stat-card">
      <div class="stat-value medium">${riskMetrics.mediumCount}</div>
      <div class="stat-label">Medium Risk</div>
    </div>
    <div class="stat-card">
      <div class="stat-value low">${riskMetrics.lowCount}</div>
      <div class="stat-label">Low Risk</div>
    </div>
  </div>

  ${includeCompliance ? `
  <h2>📋 Compliance Coverage</h2>
  ${frameworkCoverage.map(fc => `
    <h3>${fc.framework}</h3>
    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
      <div style="flex: 1;">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${fc.coveragePercent}%; background: ${fc.coveragePercent >= 80 ? '#16a34a' : fc.coveragePercent >= 60 ? '#ca8a04' : '#dc2626'};"></div>
        </div>
      </div>
      <div style="font-weight: bold;">${fc.coveragePercent}%</div>
      <div style="color: #6b7280;">(${fc.coveredControls}/${fc.totalControls} controls)</div>
    </div>
  `).join('')}
  ` : ''}

  <h2>🎯 Top 10 Highest Risk Threats</h2>
  <table class="table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Title</th>
        <th>Risk Score</th>
        <th>Severity</th>
        <th>Priority</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${[...riskScores.entries()]
        .sort((a, b) => b[1].overall - a[1].overall)
        .slice(0, 10)
        .map(([id, score]) => {
          const threat = threats.find(t => t.id === id)!;
          return `
          <tr>
            <td><strong>${id}</strong></td>
            <td>${threat.title.substring(0, 50)}${threat.title.length > 50 ? '...' : ''}</td>
            <td><span class="badge ${score.riskLevel === 'Critical' ? 'badge-red' : score.riskLevel === 'High' ? 'badge-orange' : score.riskLevel === 'Medium' ? 'badge-yellow' : 'badge-green'}">${score.overall}</span></td>
            <td><span class="badge ${threat.severity === 'HIGH' ? 'badge-red' : threat.severity === 'MEDIUM' ? 'badge-orange' : 'badge-green'}">${threat.severity}</span></td>
            <td><span class="badge ${threat.priority === 'P0' ? 'badge-red' : threat.priority === 'P1' ? 'badge-orange' : 'badge-blue'}">${threat.priority}</span></td>
            <td>${threat.status}</td>
          </tr>
        `;
        }).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>Generated by CRM Threat Management Platform</p>
    <p>This report is confidential and intended for authorized personnel only.</p>
  </div>
</body>
</html>
    `;
    
    downloadFile(htmlContent, 'executive-report.html', 'text/html');
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type: `${type};charset=utf-8;` });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <FileText className="h-4 w-4" />
          Generate Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Generate Executive Report
          </DialogTitle>
          <DialogDescription>
            Export threat data and security metrics for stakeholder communication
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Include in Report</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="metrics" 
                checked={includeMetrics}
                onCheckedChange={(checked) => setIncludeMetrics(!!checked)}
              />
              <Label htmlFor="metrics" className="text-sm cursor-pointer">
                Security Metrics (SLA, MTTR, Velocity)
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="risk" 
                checked={includeRiskScores}
                onCheckedChange={(checked) => setIncludeRiskScores(!!checked)}
              />
              <Label htmlFor="risk" className="text-sm cursor-pointer">
                Risk Scores (CVSS-like calculations)
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="compliance" 
                checked={includeCompliance}
                onCheckedChange={(checked) => setIncludeCompliance(!!checked)}
              />
              <Label htmlFor="compliance" className="text-sm cursor-pointer">
                Compliance Coverage (NIST, CIS, ISO, SOC2)
              </Label>
            </div>
          </div>
          
          <div className="pt-4 border-t space-y-2">
            <Label className="text-sm font-medium">Export Format</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" className="flex-col h-auto py-4" onClick={exportToHTML}>
                <FileText className="h-6 w-6 mb-2" />
                <span className="text-xs">HTML Report</span>
                <span className="text-[10px] text-muted-foreground">Print-ready</span>
              </Button>
              
              <Button variant="outline" className="flex-col h-auto py-4" onClick={exportToCSV}>
                <Table className="h-6 w-6 mb-2" />
                <span className="text-xs">CSV Export</span>
                <span className="text-[10px] text-muted-foreground">Spreadsheet</span>
              </Button>
              
              <Button variant="outline" className="flex-col h-auto py-4" onClick={exportToJSON}>
                <FileJson className="h-6 w-6 mb-2" />
                <span className="text-xs">JSON Export</span>
                <span className="text-[10px] text-muted-foreground">Full data</span>
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <p className="text-xs text-muted-foreground">
            Reports include {threats.length} threats as of {new Date().toLocaleDateString()}
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
