import { pgTable, varchar, text, timestamp, uuid, jsonb, pgEnum, boolean } from 'drizzle-orm/pg-core';

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'editor', 'viewer']);
export const strideEnum = pgEnum('stride_category', ['Spoofing', 'Tampering', 'Repudiation', 'Information Disclosure', 'Denial of Service', 'Elevation of Privilege']);
export const severityEnum = pgEnum('severity', ['LOW', 'MEDIUM', 'HIGH']);
export const priorityEnum = pgEnum('priority', ['P0', 'P1', 'P2']);
export const impactEnum = pgEnum('impact', ['None', 'Low', 'Medium', 'High', 'Critical']);
export const likelihoodEnum = pgEnum('likelihood', ['Low', 'Medium', 'High']);
export const statusEnum = pgEnum('status', ['Open', 'In Progress', 'Mitigated', 'Accepted Risk', 'Closed']);
export const requirementStatusEnum = pgEnum('requirement_status', ['not_implemented', 'in_progress', 'implemented', 'partial']);
export const mitigationStatusEnum = pgEnum('mitigation_status', ['planned', 'in_progress', 'completed']);

// Tenants table
export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default('viewer'),
  mfaEnabled: boolean('mfa_enabled').notNull().default(false),
  mfaSecret: text('mfa_secret'),
  mfaEnrolledAt: timestamp('mfa_enrolled_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tenant memberships table
export const tenantMemberships = pgTable('tenant_memberships', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  role: userRoleEnum('role').notNull().default('viewer'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Threats table
export const threats = pgTable('threats', {
  id: varchar('id', { length: 20 }).primaryKey(), // TM-001, TM-002, etc.
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  strideCategory: strideEnum('stride_category').notNull(),
  title: text('title').notNull(),
  affectedComponents: text('affected_components').notNull(),
  asset: text('asset').notNull(),
  cloudProvider: varchar('cloud_provider', { length: 50 }),
  cloudAssetType: varchar('cloud_asset_type', { length: 100 }),
  cloudControlMapping: text('cloud_control_mapping').array(),
  attackScenario: text('attack_scenario').notNull(),
  impactConfidentiality: impactEnum('impact_confidentiality').notNull(),
  impactIntegrity: impactEnum('impact_integrity').notNull(),
  impactAvailability: impactEnum('impact_availability').notNull(),
  likelihood: likelihoodEnum('likelihood').notNull(),
  severity: severityEnum('severity').notNull(),
  owaspMapping: varchar('owasp_mapping', { length: 100 }),
  priority: priorityEnum('priority').notNull(),
  owner: text('owner').notNull(),
  status: statusEnum('status').notNull().default('Open'),
  threatActor: text('threat_actor'), // TA-001, TA-002, etc.
  preconditions: text('preconditions'),
  detectionLogs: text('detection_logs'),
  detectionAlerts: text('detection_alerts'),
  mitigationPrimary: text('mitigation_primary'),
  mitigationAdditional: text('mitigation_additional'),
  testingNotes: text('testing_notes'),
  references: text('references'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Requirements table
export const requirements = pgTable('requirements', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  section: varchar('section', { length: 255 }).notNull(), // e.g., "Tenant Isolation", "Authentication"
  description: text('description').notNull(),
  status: requirementStatusEnum('status').notNull().default('not_implemented'),
  threatRefs: text('threat_refs').array(), // ['TM-017', 'TM-007']
  assignedTo: uuid('assigned_to').references(() => users.id),
  priority: priorityEnum('priority').notNull(),
  testCases: text('test_cases'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Mitigations table
export const mitigations = pgTable('mitigations', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  code: varchar('code', { length: 20 }).notNull().unique(), // P0-1, P1-1, QW-1, etc.
  title: text('title').notNull(),
  description: text('description').notNull(),
  threatRefs: text('threat_refs').array(), // ['TM-017', 'TM-007']
  priority: priorityEnum('priority').notNull(),
  effortEstimate: varchar('effort_estimate', { length: 50 }), // "1 day", "1 week", "1 month"
  owner: text('owner').notNull(),
  status: mitigationStatusEnum('status').notNull().default('planned'),
  targetDate: timestamp('target_date'),
  completionDate: timestamp('completion_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Audit log table
export const auditLog = pgTable('audit_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  userId: uuid('user_id').references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(), // 'update_threat', 'mark_completed', etc.
  entityType: varchar('entity_type', { length: 50 }).notNull(), // 'threat', 'requirement', 'mitigation'
  entityId: text('entity_id').notNull(),
  changes: jsonb('changes'), // { before: {...}, after: {...} }
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  suspicious: boolean('suspicious').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Type exports for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;

export type TenantMembership = typeof tenantMemberships.$inferSelect;
export type NewTenantMembership = typeof tenantMemberships.$inferInsert;

export type Threat = typeof threats.$inferSelect;
export type NewThreat = typeof threats.$inferInsert;

export type Requirement = typeof requirements.$inferSelect;
export type NewRequirement = typeof requirements.$inferInsert;

export type Mitigation = typeof mitigations.$inferSelect;
export type NewMitigation = typeof mitigations.$inferInsert;

export type AuditLog = typeof auditLog.$inferSelect;
export type NewAuditLog = typeof auditLog.$inferInsert;
