'use client';

import { useState, useTransition } from 'react';
import { updateThreatStatus } from '@/app/actions/threat-actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface StatusUpdateProps {
  threatId: string;
  currentStatus: string;
  userRole: 'admin' | 'editor' | 'viewer';
}

const statuses = ['Open', 'In Progress', 'Mitigated', 'Accepted Risk', 'Closed'];

export default function StatusUpdate({ threatId, currentStatus, userRole }: StatusUpdateProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const canEdit = userRole === 'admin' || userRole === 'editor';

  const handleStatusChange = (newStatus: string) => {
    if (!canEdit) return;

    startTransition(async () => {
      try {
        await updateThreatStatus(threatId, newStatus as any);
        toast.success(`Status updated to "${newStatus}"`);
        router.refresh();
      } catch (error) {
        toast.error('Failed to update status');
        console.error(error);
      }
    });
  };

  return (
    <Select
      value={currentStatus}
      onValueChange={handleStatusChange}
      disabled={!canEdit || isPending}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statuses.map((status) => (
          <SelectItem key={status} value={status}>
            {status}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
