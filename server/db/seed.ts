import bcrypt from 'bcryptjs';
import { isDbConnected } from './connection';
import {
  User,
  Organization,
  Lead,
  Deal,
  Contact,
  Company,
  Task,
  Activity,
} from '../models';

import { MOCK_USERS } from '../../src/mock/users';
import { MOCK_ORGANIZATIONS } from '../../src/mock/settings';
import { MOCK_LEADS } from '../../src/mock/leads';
import { MOCK_DEALS } from '../../src/mock/deals';
import { MOCK_CONTACTS } from '../../src/mock/contacts';
import { MOCK_COMPANIES } from '../../src/mock/companies';
import { MOCK_TASKS } from '../../src/mock/tasks';
import { MOCK_ACTIVITIES } from '../../src/mock/activities';

export async function seedDatabase(force: boolean = false): Promise<void> {
  if (!isDbConnected()) {
    return;
  }

  try {
    const userCount = await User.countDocuments();
    if (userCount > 0 && !force) {
      console.log(`📦 MongoDB already populated (${userCount} users present). Skipping auto-seed.`);
      return;
    }

    console.log('🌱 Starting MongoDB dummy data seeding...');

    if (force) {
      await Promise.all([
        User.deleteMany({}),
        Organization.deleteMany({}),
        Lead.deleteMany({}),
        Deal.deleteMany({}),
        Contact.deleteMany({}),
        Company.deleteMany({}),
        Task.deleteMany({}),
        Activity.deleteMany({}),
      ]);
      console.log('🧹 Existing collections cleared for fresh seed.');
    }

    // 1. Seed Organizations
    const orgs = MOCK_ORGANIZATIONS.map((org) => ({
      id: org.id,
      name: org.name,
      logo: org.logo,
      industry: org.industry,
      currency: org.currency,
      currencySymbol: org.currencySymbol,
      timezone: org.timezone,
      plan: org.plan,
    }));
    await Organization.insertMany(orgs as any);
    console.log(`   ✓ Seeded ${orgs.length} Organizations`);

    // 2. Seed Users with bcrypt passwords
    const usersWithHashes = MOCK_USERS.map((u) => {
      let rawPass = 'demo1234';
      if (u.role === 'Super Admin' || u.role === 'Admin') rawPass = 'admin@inbox2025';
      else if (u.role === 'Manager') rawPass = 'manager@inbox2025';
      else rawPass = 'sales@inbox2025';

      return {
        id: u.id,
        organizationId: u.organizationId || 'org_inbox_01',
        name: u.name,
        email: u.email.toLowerCase(),
        passwordHash: bcrypt.hashSync(rawPass, 10),
        role: u.role,
        department: u.department,
        phone: u.phone,
        avatarUrl: u.avatarUrl,
        status: u.status,
      };
    });
    await User.insertMany(usersWithHashes as any);
    console.log(`   ✓ Seeded ${usersWithHashes.length} Users with bcrypt password hashes`);

    // 3. Seed Companies
    const companies = MOCK_COMPANIES.map((c) => ({
      id: c.id,
      organizationId: c.organizationId || 'org_inbox_01',
      name: c.name,
      industry: c.industry,
      website: c.website,
      phone: c.phone,
      location: c.location,
      employees: c.employees,
      annualRevenue: c.annualRevenue,
      status: c.status,
      notes: c.notes,
    }));
    await Company.insertMany(companies as any);
    console.log(`   ✓ Seeded ${companies.length} Companies`);

    // 4. Seed Contacts
    const contacts = MOCK_CONTACTS.map((cnt: any) => ({
      id: cnt.id,
      organizationId: cnt.organizationId || 'org_inbox_01',
      name: cnt.name,
      email: cnt.email,
      phone: cnt.phone,
      companyId: cnt.companyId,
      companyName: cnt.companyName,
      jobTitle: cnt.jobTitle,
      status: cnt.status,
      avatarUrl: cnt.avatarUrl,
      linkedin: cnt.linkedin || cnt.linkedinUrl,
      notes: cnt.notes,
    }));
    await Contact.insertMany(contacts as any);
    console.log(`   ✓ Seeded ${contacts.length} Contacts`);

    // 5. Seed Leads
    const leads = MOCK_LEADS.map((l) => ({
      id: l.id,
      organizationId: l.organizationId || 'org_inbox_01',
      name: l.name,
      companyName: l.companyName,
      email: l.email,
      phone: l.phone,
      source: l.source,
      status: l.status,
      leadScore: l.leadScore,
      aiInsight: l.aiInsight,
      scoreFactors: l.scoreFactors,
      ownerId: l.ownerId,
      ownerName: l.ownerName,
      estimatedValue: l.estimatedValue,
      title: l.title,
      location: l.location,
      notes: l.notes,
      convertedContactId: l.convertedContactId,
      convertedCompanyId: l.convertedCompanyId,
      convertedDealId: l.convertedDealId,
    }));
    await Lead.insertMany(leads as any);
    console.log(`   ✓ Seeded ${leads.length} Leads`);

    // 6. Seed Deals
    const deals = MOCK_DEALS.map((d) => ({
      id: d.id,
      organizationId: d.organizationId || 'org_inbox_01',
      name: d.name,
      companyId: d.companyId,
      companyName: d.companyName,
      contactId: d.contactId,
      contactName: d.contactName,
      value: d.value,
      stage: d.stage,
      probability: d.probability,
      expectedCloseDate: d.expectedCloseDate,
      ownerId: d.ownerId,
      ownerName: d.ownerName,
      notes: d.notes,
    }));
    await Deal.insertMany(deals as any);
    console.log(`   ✓ Seeded ${deals.length} Deals`);

    // 7. Seed Tasks
    const tasks = MOCK_TASKS.map((t: any) => ({
      id: t.id,
      organizationId: t.organizationId || 'org_inbox_01',
      title: t.title,
      description: t.description,
      dueDate: t.dueDate,
      priority: t.priority,
      status: t.status,
      assignedToName: t.assignedToName,
      assignedToId: t.assignedToId,
      relatedEntityId: t.relatedEntityId,
      relatedEntityType: t.relatedEntityType,
      relatedEntityName: t.relatedEntityName,
      completedAt: t.completedAt,
    }));
    await Task.insertMany(tasks as any);
    console.log(`   ✓ Seeded ${tasks.length} Tasks`);

    // 8. Seed Activities
    const activities = MOCK_ACTIVITIES.map((a: any) => ({
      id: a.id,
      organizationId: a.organizationId || 'org_inbox_01',
      type: a.type,
      title: a.title,
      description: a.description,
      performedByName: a.performedByName,
      performedById: a.performedById,
      occurredAt: a.occurredAt,
      relatedEntityId: a.relatedEntityId,
      relatedEntityType: a.relatedEntityType,
      relatedEntityName: a.relatedEntityName,
    }));
    await Activity.insertMany(activities as any);
    console.log(`   ✓ Seeded ${activities.length} Activities`);

    console.log('✅ Dummy data seeding complete! All mock entities inserted into MongoDB.\n');
  } catch (err) {
    console.error('Seeding error:', err);
  }
}
