'use client';

import { useState, useMemo } from 'react';
import { Threat } from '@/lib/db/schema';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Search, Filter, ArrowUpDown, AlertTriangle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { calculateRiskScore, calculateAllRiskScores } from '@/lib/risk-scoring';
import { getComplianceControlsForThreat } from '@/lib/compliance-mapping';
import { getThreatAttackMapping } from '@/lib/mitre-attack';

interface ThreatsTableProps {
  threats: Threat[];
  initialFilters?: {
    query?: string;
    stride?: string;
    severity?: string;
    priority?: string;
    status?: string;
  };
}

const strideCategories = [
  'All',
  'Spoofing',
  'Tampering',
  'Repudiation',
  'Information Disclosure',
  'Denial of Service',
  'Elevation of Privilege',
];

const severities = ['All', 'LOW', 'MEDIUM', 'HIGH'];
const priorities = ['All', 'P0', 'P1', 'P2'];
const statuses = ['All', 'Open', 'In Progress', 'Mitigated', 'Accepted Risk', 'Closed'];
const riskLevels = ['All', 'Critical', 'High', 'Medium', 'Low'];

type SortField = 'id' | 'severity' | 'priority' | 'riskScore' | 'status';
type SortDirection = 'asc' | 'desc';

export default function ThreatsTable({ threats }: ThreatsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [strideFilter, setStrideFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [sortField, setSortField] = useState<SortField>('riskScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Calculate all risk scores
  const riskScores = useMemo(() => calculateAllRiskScores(threats), [threats]);
export default function ThreatsTable({ threats, initialFilters }: ThreatsTableProps) {
  const [searchQuery, setSearchQuery] = useState(initialFilters?.query ?? '');
  const [strideFilter, setStrideFilter] = useState(initialFilters?.stride ?? 'All');
  const [severityFilter, setSeverityFilter] = useState(initialFilters?.severity ?? 'All');
  const [priorityFilter, setPriorityFilter] = useState(initialFilters?.priority ?? 'All');
  const [statusFilter, setStatusFilter] = useState(initialFilters?.status ?? 'All');

  const filteredAndSortedThreats = useMemo(() => {
    // Filter first
    let result = threats.filter((threat) => {
      const matchesSearch =
        searchQuery === '' ||
        threat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        threat.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        threat.affectedComponents.toLowerCase().includes(searchQuery.toLowerCase()) ||
        threat.cloudProvider?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        threat.cloudAssetType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        threat.cloudControlMapping?.some((mapping) =>
          mapping.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesStride = strideFilter === 'All' || threat.strideCategory === strideFilter;
      const matchesSeverity = severityFilter === 'All' || threat.severity === severityFilter;
      const matchesPriority = priorityFilter === 'All' || threat.priority === priorityFilter;
      const matchesStatus = statusFilter === 'All' || threat.status === statusFilter;
      
      const score = riskScores.get(threat.id);
      const matchesRisk = riskFilter === 'All' || score?.riskLevel === riskFilter;

      return matchesSearch && matchesStride && matchesSeverity && matchesPriority && matchesStatus && matchesRisk;
    });

    // Then sort
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'id':
          comparison = a.id.localeCompare(b.id);
          break;
        case 'severity':
          const severityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
          comparison = (severityOrder[a.severity] || 0) - (severityOrder[b.severity] || 0);
          break;
        case 'priority':
          const priorityOrder = { 'P0': 3, 'P1': 2, 'P2': 1 };
          comparison = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
          break;
        case 'riskScore':
          comparison = (riskScores.get(a.id)?.overall || 0) - (riskScores.get(b.id)?.overall || 0);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      
      return sortDirection === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [threats, searchQuery, strideFilter, severityFilter, priorityFilter, statusFilter, riskFilter, sortField, sortDirection, riskScores]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return 'bg-red-600 hover:bg-red-700';
      case 'MEDIUM':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'LOW':
        return 'bg-green-600 hover:bg-green-700';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P0':
        return 'bg-red-600 hover:bg-red-700';
      case 'P1':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'P2':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'Mitigated':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'Accepted Risk':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'Closed':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Critical':
        return 'bg-gradient-to-r from-red-600 to-red-700 text-white';
      case 'High':
        return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white';
      case 'Medium':
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
      case 'Low':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={() => toggleSort(field)}
      className="h-auto p-0 font-semibold hover:bg-transparent"
    >
      {children}
      <ArrowUpDown className={`ml-1 h-3 w-3 ${sortField === field ? 'opacity-100' : 'opacity-40'}`} />
    </Button>
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-6">
            <div className="relative md:col-span-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search threats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={strideFilter} onValueChange={setStrideFilter}>
              <SelectTrigger>
                <SelectValue placeholder="STRIDE Category" />
              </SelectTrigger>
              <SelectContent>
                {strideCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                {riskLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>
                Showing {filteredAndSortedThreats.length} of {threats.length} threats
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs">
                Sorted by: <strong className="capitalize">{sortField.replace('riskScore', 'Risk Score')}</strong> ({sortDirection})
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-24">
                    <SortButton field="id">ID</SortButton>
                  </TableHead>
                  <TableHead className="w-36">STRIDE</TableHead>
                  <TableHead>Threat Title</TableHead>
                  <TableHead className="w-24 text-center">
                    <SortButton field="riskScore">Risk</SortButton>
                  </TableHead>
                  <TableHead className="w-24 text-center">
                    <SortButton field="severity">Severity</SortButton>
                  </TableHead>
                  <TableHead className="w-20 text-center">
                    <SortButton field="priority">Priority</SortButton>
                  </TableHead>
                  <TableHead className="w-32 text-center">
                    <SortButton field="status">Status</SortButton>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedThreats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No threats found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedThreats.map((threat) => {
                    const score = riskScores.get(threat.id)!;
                    const controls = getComplianceControlsForThreat(threat);
                    const attackMapping = getThreatAttackMapping(threat);
                    
                    return (
                      <TableRow key={threat.id} className="group hover:bg-blue-50/50">
                        <TableCell className="font-mono text-sm font-medium">
                          <Link href={`/threats/${threat.id}`} className="text-blue-600 hover:underline">
                            {threat.id}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                            {threat.strideCategory}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Link href={`/threats/${threat.id}`} className="hover:text-blue-600">
                            <div className="font-medium">{threat.title}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1 mt-1">
                              {threat.affectedComponents}
                            </div>
                            <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {controls.length > 0 && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Badge variant="outline" className="text-[10px] h-5">
                                        {controls.length} controls
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="text-xs">
                                        Maps to {controls.length} compliance controls
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              {attackMapping.techniques.length > 0 && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Badge variant="outline" className="text-[10px] h-5">
                                        {attackMapping.techniques.length} ATT&CK
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="text-xs">
                                        {attackMapping.techniques.slice(0, 3).map(t => t.name).join(', ')}
                                        {attackMapping.techniques.length > 3 && '...'}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="text-center">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getRiskColor(score.riskLevel)}`}>
                                  {score.overall.toFixed(1)}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="space-y-1 text-xs">
                                  <div><strong>Risk Level:</strong> {score.riskLevel}</div>
                                  <div><strong>Impact:</strong> {score.impactScore.toFixed(1)}/10</div>
                                  <div><strong>Likelihood:</strong> {(score.likelihoodScore * 100).toFixed(0)}%</div>
                                  <div><strong>Percentile:</strong> {score.percentile}th</div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={getSeverityColor(threat.severity)}>{threat.severity}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={getPriorityColor(threat.priority)}>{threat.priority}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className={getStatusColor(threat.status)}>
                            {threat.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
