'use server';

import { db } from '@/lib/db';
import { threats, auditLog } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function updateThreatStatus(
  threatId: string,
  newStatus: 'Open' | 'In Progress' | 'Mitigated' | 'Accepted Risk' | 'Closed'
) {
  const session = await auth();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Only editors and admins can update status
  if (session.user.role === 'viewer') {
    throw new Error('Insufficient permissions');
  }

  try {
    // Get current threat state
    const [currentThreat] = await db
      .select()
      .from(threats)
      .where(eq(threats.id, threatId))
      .limit(1);

    if (!currentThreat) {
      throw new Error('Threat not found');
    }

    // Update threat status
    await db
      .update(threats)
      .set({
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(threats.id, threatId));

    // Create audit log entry
    await db.insert(auditLog).values({
      userId: session.user.id,
      action: 'update_threat_status',
      entityType: 'threat',
      entityId: threatId,
      changes: {
        before: { status: currentThreat.status },
        after: { status: newStatus },
      },
    });

    // Revalidate pages
    revalidatePath('/');
    revalidatePath('/threats');
    revalidatePath(`/threats/${threatId}`);

    return { success: true };
  } catch (error) {
    console.error('Error updating threat status:', error);
    throw error;
  }
}

export async function updateThreat(threatId: string, data: {
  title?: string;
  attackScenario?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH';
  priority?: 'P0' | 'P1' | 'P2';
  status?: 'Open' | 'In Progress' | 'Mitigated' | 'Accepted Risk' | 'Closed';
  owner?: string;
  mitigationPrimary?: string;
  mitigationAdditional?: string;
  notes?: string;
}) {
  const session = await auth();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Only editors and admins can edit threats
  if (session.user.role === 'viewer') {
    throw new Error('Insufficient permissions');
  }

  try {
    // Get current threat state
    const [currentThreat] = await db
      .select()
      .from(threats)
      .where(eq(threats.id, threatId))
      .limit(1);

    if (!currentThreat) {
      throw new Error('Threat not found');
    }

    // Update threat
    await db
      .update(threats)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(threats.id, threatId));

    // Create audit log entry
    await db.insert(auditLog).values({
      userId: session.user.id,
      action: 'update_threat',
      entityType: 'threat',
      entityId: threatId,
      changes: {
        before: currentThreat,
        after: { ...currentThreat, ...data },
      },
    });

    // Revalidate pages
    revalidatePath('/');
    revalidatePath('/threats');
    revalidatePath(`/threats/${threatId}`);

    return { success: true };
  } catch (error) {
    console.error('Error updating threat:', error);
    throw error;
  }
}

export async function deleteThreat(threatId: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Only admins can delete threats
  if (session.user.role !== 'admin') {
    throw new Error('Insufficient permissions - admin only');
  }

  try {
    // Get current threat for audit log
    const [currentThreat] = await db
      .select()
      .from(threats)
      .where(eq(threats.id, threatId))
      .limit(1);

    if (!currentThreat) {
      throw new Error('Threat not found');
    }

    // Delete threat
    await db.delete(threats).where(eq(threats.id, threatId));

    // Create audit log entry
    await db.insert(auditLog).values({
      userId: session.user.id,
      action: 'delete_threat',
      entityType: 'threat',
      entityId: threatId,
      changes: {
        before: currentThreat,
        after: null,
      },
    });

    // Revalidate pages
    revalidatePath('/');
    revalidatePath('/threats');

    return { success: true };
  } catch (error) {
    console.error('Error deleting threat:', error);
    throw error;
  }
}
