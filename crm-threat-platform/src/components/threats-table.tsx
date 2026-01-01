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
import { Search, Filter } from 'lucide-react';
import Link from 'next/link';

interface ThreatsTableProps {
  threats: Threat[];
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

export default function ThreatsTable({ threats }: ThreatsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [strideFilter, setStrideFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredThreats = useMemo(() => {
    return threats.filter((threat) => {
      const matchesSearch =
        searchQuery === '' ||
        threat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        threat.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        threat.affectedComponents.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStride = strideFilter === 'All' || threat.strideCategory === strideFilter;
      const matchesSeverity = severityFilter === 'All' || threat.severity === severityFilter;
      const matchesPriority = priorityFilter === 'All' || threat.priority === priorityFilter;
      const matchesStatus = statusFilter === 'All' || threat.status === statusFilter;

      return matchesSearch && matchesStride && matchesSeverity && matchesPriority && matchesStatus;
    });
  }, [threats, searchQuery, strideFilter, severityFilter, priorityFilter, statusFilter]);

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

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-5">
            <div className="relative">
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
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                {severities.map((severity) => (
                  <SelectItem key={severity} value={severity}>
                    {severity}
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
                Showing {filteredThreats.length} of {threats.length} threats
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
                <TableRow>
                  <TableHead className="w-24">ID</TableHead>
                  <TableHead className="w-40">STRIDE</TableHead>
                  <TableHead>Threat Title</TableHead>
                  <TableHead className="w-48">Components</TableHead>
                  <TableHead className="w-24">Severity</TableHead>
                  <TableHead className="w-24">Priority</TableHead>
                  <TableHead className="w-32">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredThreats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No threats found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredThreats.map((threat) => (
                    <TableRow key={threat.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-mono text-sm">
                        <Link href={`/threats/${threat.id}`} className="hover:underline">
                          {threat.id}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {threat.strideCategory}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link href={`/threats/${threat.id}`} className="hover:underline">
                          <div className="font-medium">{threat.title}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {threat.attackScenario}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">{threat.affectedComponents}</TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(threat.severity)}>{threat.severity}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(threat.priority)}>{threat.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getStatusColor(threat.status)}>
                          {threat.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
