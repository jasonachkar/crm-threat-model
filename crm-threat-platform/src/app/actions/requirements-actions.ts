'use server';

import { db } from '@/lib/db';
import { auditLog, requirements } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createRequirement(data: {
  section: string;
  description: string;
  status: 'not_implemented' | 'in_progress' | 'implemented' | 'partial';
  priority: 'P0' | 'P1' | 'P2';
  threatRefs?: string[];
  assignedTo?: string | null;
  testCases?: string | null;
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
    const [createdRequirement] = await db
      .insert(requirements)
      .values({
        ...data,
        updatedAt: new Date(),
      })
      .returning();

    if (!createdRequirement) {
      throw new Error('Failed to create requirement');
    }

    await db.insert(auditLog).values({
      userId: session.user.id,
      action: 'create_requirement',
      entityType: 'requirement',
      entityId: createdRequirement.id,
      changes: {
        before: null,
        after: createdRequirement,
      },
    });

    revalidatePath('/requirements');

    return { success: true, requirement: createdRequirement };
  } catch (error) {
    console.error('Error creating requirement:', error);
    throw error;
  }
}

export async function updateRequirement(
  requirementId: string,
  data: {
    section?: string;
    description?: string;
    status?: 'not_implemented' | 'in_progress' | 'implemented' | 'partial';
    priority?: 'P0' | 'P1' | 'P2';
    threatRefs?: string[];
    assignedTo?: string | null;
    testCases?: string | null;
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
    const [currentRequirement] = await db
      .select()
      .from(requirements)
      .where(eq(requirements.id, requirementId))
      .limit(1);

    if (!currentRequirement) {
      throw new Error('Requirement not found');
    }

    await db
      .update(requirements)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(requirements.id, requirementId));

    await db.insert(auditLog).values({
      userId: session.user.id,
      action: 'update_requirement',
      entityType: 'requirement',
      entityId: requirementId,
      changes: {
        before: currentRequirement,
        after: { ...currentRequirement, ...data },
      },
    });

    revalidatePath('/requirements');

    return { success: true };
  } catch (error) {
    console.error('Error updating requirement:', error);
    throw error;
  }
}

export async function updateRequirementStatus(
  requirementId: string,
  newStatus: 'not_implemented' | 'in_progress' | 'implemented' | 'partial'
) {
  const session = await auth();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (session.user.role === 'viewer') {
    throw new Error('Insufficient permissions');
  }

  try {
    const [currentRequirement] = await db
      .select()
      .from(requirements)
      .where(eq(requirements.id, requirementId))
      .limit(1);

    if (!currentRequirement) {
      throw new Error('Requirement not found');
    }

    await db
      .update(requirements)
      .set({
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(requirements.id, requirementId));

    await db.insert(auditLog).values({
      userId: session.user.id,
      action: 'update_requirement_status',
      entityType: 'requirement',
      entityId: requirementId,
      changes: {
        before: { status: currentRequirement.status },
        after: { status: newStatus },
      },
    });

    revalidatePath('/requirements');

    return { success: true };
  } catch (error) {
    console.error('Error updating requirement status:', error);
    throw error;
  }
}
