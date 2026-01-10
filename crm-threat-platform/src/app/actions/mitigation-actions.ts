'use server';

import { db } from '@/lib/db';
import { auditLog, mitigations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createMitigation(data: {
  code: string;
  title: string;
  description: string;
  threatRefs?: string[];
  priority: 'P0' | 'P1' | 'P2';
  effortEstimate?: string | null;
  owner: string;
  status: 'planned' | 'in_progress' | 'completed';
  targetDate?: Date | null;
  completionDate?: Date | null;
  notes?: string | null;
}) {
  const session = await auth();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (session.user.role === 'viewer') {
    throw new Error('Insufficient permissions');
  }

  try {
    const [createdMitigation] = await db
      .insert(mitigations)
      .values({
        ...data,
        updatedAt: new Date(),
      })
      .returning();

    if (!createdMitigation) {
      throw new Error('Failed to create mitigation');
    }

    await db.insert(auditLog).values({
      userId: session.user.id,
      action: 'create_mitigation',
      entityType: 'mitigation',
      entityId: createdMitigation.id,
      changes: {
        before: null,
        after: createdMitigation,
      },
    });

    revalidatePath('/mitigations');

    return { success: true, mitigation: createdMitigation };
  } catch (error) {
    console.error('Error creating mitigation:', error);
    throw error;
  }
}

export async function updateMitigation(
  mitigationId: string,
  data: {
    code?: string;
    title?: string;
    description?: string;
    threatRefs?: string[];
    priority?: 'P0' | 'P1' | 'P2';
    effortEstimate?: string | null;
    owner?: string;
    status?: 'planned' | 'in_progress' | 'completed';
    targetDate?: Date | null;
    completionDate?: Date | null;
    notes?: string | null;
  }
) {
  const session = await auth();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (session.user.role === 'viewer') {
    throw new Error('Insufficient permissions');
  }

  try {
    const [currentMitigation] = await db
      .select()
      .from(mitigations)
      .where(eq(mitigations.id, mitigationId))
      .limit(1);

    if (!currentMitigation) {
      throw new Error('Mitigation not found');
    }

    await db
      .update(mitigations)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(mitigations.id, mitigationId));

    await db.insert(auditLog).values({
      userId: session.user.id,
      action: 'update_mitigation',
      entityType: 'mitigation',
      entityId: mitigationId,
      changes: {
        before: currentMitigation,
        after: { ...currentMitigation, ...data },
      },
    });

    revalidatePath('/mitigations');

    return { success: true };
  } catch (error) {
    console.error('Error updating mitigation:', error);
    throw error;
  }
}

export async function updateMitigationStatus(
  mitigationId: string,
  newStatus: 'planned' | 'in_progress' | 'completed'
) {
  const session = await auth();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (session.user.role === 'viewer') {
    throw new Error('Insufficient permissions');
  }

  try {
    const [currentMitigation] = await db
      .select()
      .from(mitigations)
      .where(eq(mitigations.id, mitigationId))
      .limit(1);

    if (!currentMitigation) {
      throw new Error('Mitigation not found');
    }

    await db
      .update(mitigations)
      .set({
        status: newStatus,
        completionDate: newStatus === 'completed' ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(mitigations.id, mitigationId));

    await db.insert(auditLog).values({
      userId: session.user.id,
      action: 'update_mitigation_status',
      entityType: 'mitigation',
      entityId: mitigationId,
      changes: {
        before: { status: currentMitigation.status },
        after: { status: newStatus },
      },
    });

    revalidatePath('/mitigations');

    return { success: true };
  } catch (error) {
    console.error('Error updating mitigation status:', error);
    throw error;
  }
}
