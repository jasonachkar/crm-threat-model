import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { db } from '../src/lib/db';
import { users, threats } from '../src/lib/db/schema';
import bcrypt from 'bcryptjs';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';

// Map CSV column names to database schema
const mapImpact = (value: string): 'None' | 'Low' | 'Medium' | 'High' | 'Critical' => {
  const normalized = value.trim();
  if (['None', 'Low', 'Medium', 'High', 'Critical'].includes(normalized)) {
    return normalized as 'None' | 'Low' | 'Medium' | 'High' | 'Critical';
  }
  return 'Medium'; // Default fallback
};

const mapLikelihood = (value: string): 'Low' | 'Medium' | 'High' => {
  const normalized = value.trim();
  if (['Low', 'Medium', 'High'].includes(normalized)) {
    return normalized as 'Low' | 'Medium' | 'High';
  }
  return 'Medium'; // Default fallback
};

const mapSeverity = (value: string): 'LOW' | 'MEDIUM' | 'HIGH' => {
  const normalized = value.trim().toUpperCase();
  if (normalized === 'LOW' || normalized === 'MEDIUM' || normalized === 'HIGH') {
    return normalized as 'LOW' | 'MEDIUM' | 'HIGH';
  }
  // Handle variations like "MEDIUM-HIGH" -> "HIGH", "LOW-MED" -> "MEDIUM"
  if (normalized.includes('HIGH')) return 'HIGH';
  if (normalized.includes('MED')) return 'MEDIUM';
  return 'MEDIUM'; // Default fallback
};

const mapPriority = (value: string): 'P0' | 'P1' | 'P2' => {
  const normalized = value.trim();
  if (normalized === 'P0' || normalized === 'P1' || normalized === 'P2') {
    return normalized as 'P0' | 'P1' | 'P2';
  }
  return 'P2'; // Default fallback
};

const mapStatus = (value: string): 'Open' | 'In Progress' | 'Mitigated' | 'Accepted Risk' | 'Closed' => {
  const normalized = value.trim();
  const validStatuses = ['Open', 'In Progress', 'Mitigated', 'Accepted Risk', 'Closed'];
  if (validStatuses.includes(normalized)) {
    return normalized as 'Open' | 'In Progress' | 'Mitigated' | 'Accepted Risk' | 'Closed';
  }
  return 'Open'; // Default fallback
};

const mapStrideCategory = (value: string): 'Spoofing' | 'Tampering' | 'Repudiation' | 'Information Disclosure' | 'Denial of Service' | 'Elevation of Privilege' => {
  const normalized = value.trim();
  const validCategories = ['Spoofing', 'Tampering', 'Repudiation', 'Information Disclosure', 'Denial of Service', 'Elevation of Privilege'];
  if (validCategories.includes(normalized)) {
    return normalized as any;
  }
  return 'Spoofing'; // Default fallback
};

async function seedUsers() {
  console.log('Seeding users...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  await db.insert(users).values({
    email: 'admin@crm-threat.com',
    passwordHash: hashedPassword,
    role: 'admin',
  }).onConflictDoNothing();

  // Create editor user
  const editorPassword = await bcrypt.hash('editor123', 10);

  await db.insert(users).values({
    email: 'editor@crm-threat.com',
    passwordHash: editorPassword,
    role: 'editor',
  }).onConflictDoNothing();

  // Create viewer user
  const viewerPassword = await bcrypt.hash('viewer123', 10);

  await db.insert(users).values({
    email: 'viewer@crm-threat.com',
    passwordHash: viewerPassword,
    role: 'viewer',
  }).onConflictDoNothing();

  console.log('✓ Users created:');
  console.log('  - admin@crm-threat.com / admin123 (admin)');
  console.log('  - editor@crm-threat.com / editor123 (editor)');
  console.log('  - viewer@crm-threat.com / viewer123 (viewer)');
}

async function seedThreats() {
  console.log('\nSeeding threats from CSV...');

  // Read the threats CSV file
  const csvPath = path.join(__dirname, '../../crm-threat-model/tables/threats.csv');

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found at: ${csvPath}`);
    return;
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');

  // Parse CSV
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  });

  console.log(`Found ${records.length} threats in CSV`);

  // Insert each threat
  for (const record of records) {
    try {
      await db.insert(threats).values({
        id: record['ID'],
        strideCategory: mapStrideCategory(record['STRIDE Category']),
        title: record['Threat Title'],
        affectedComponents: record['Affected Components'],
        asset: record['Asset'],
        attackScenario: record['Attack Scenario Summary'],
        impactConfidentiality: mapImpact(record['Impact Confidentiality']),
        impactIntegrity: mapImpact(record['Impact Integrity']),
        impactAvailability: mapImpact(record['Impact Availability']),
        likelihood: mapLikelihood(record['Likelihood']),
        severity: mapSeverity(record['Severity']),
        owaspMapping: record['OWASP Mapping'] || null,
        priority: mapPriority(record['Priority']),
        owner: record['Owner'],
        status: mapStatus(record['Status']),
      }).onConflictDoNothing();

      console.log(`  ✓ Imported ${record['ID']}: ${record['Threat Title']}`);
    } catch (error) {
      console.error(`  ✗ Failed to import ${record['ID']}:`, error);
    }
  }

  console.log('\n✓ Threats imported successfully');
}

async function main() {
  console.log('Starting database seed...\n');

  try {
    await seedUsers();
    await seedThreats();

    console.log('\n✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

main();
