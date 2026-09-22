import { Lead, Contact, Company, Deal, Task, Activity, User, Organization, PipelineStageConfig, CustomFieldConfig, DashboardKpiSummary } from '../types';
import { MOCK_USERS } from './users';
import { MOCK_COMPANIES } from './companies';
import { MOCK_CONTACTS } from './contacts';
import { MOCK_LEADS } from './leads';
import { MOCK_DEALS } from './deals';
import { MOCK_TASKS } from './tasks';
import { MOCK_ACTIVITIES } from './activities';
import { MOCK_ORGANIZATIONS, MOCK_PIPELINE_STAGES, MOCK_CUSTOM_FIELDS } from './settings';

class MockDatabase {
  private users: User[] = [...MOCK_USERS];
  private companies: Company[] = [...MOCK_COMPANIES];
  private contacts: Contact[] = [...MOCK_CONTACTS];
  private leads: Lead[] = [...MOCK_LEADS];
  private deals: Deal[] = [...MOCK_DEALS];
  private tasks: Task[] = [...MOCK_TASKS];
  private activities: Activity[] = [...MOCK_ACTIVITIES];
  private organizations: Organization[] = [...MOCK_ORGANIZATIONS];
  private pipelineStages: PipelineStageConfig[] = [...MOCK_PIPELINE_STAGES];
  private customFields: CustomFieldConfig[] = [...MOCK_CUSTOM_FIELDS];
  private activeOrganizationId: string = 'org_nexus_01';

  constructor() {
    this.loadFromStorage();
    this.normalizeMockDates();
  }

  private normalizeMockDates() {
    const now = Date.now();
    const msHour = 3600 * 1000;
    const msDay = 24 * msHour;

    // Check if dates require calibration to current live timestamp
    let needsRefresh = true;
    try {
      const dateVersion = localStorage.getItem('nexus_crm_date_v5');
      if (dateVersion === 'v5' && this.leads.length > 0) {
        const leadDiff = Math.abs(now - new Date(this.leads[0].createdAt || 0).getTime());
        if (leadDiff < 24 * msHour) {
          needsRefresh = false;
        }
      }
    } catch {
      needsRefresh = true;
    }

    if (needsRefresh) {
      // Relative distribution offsets for leads (hours ago)
      // Leads 0-5 are created today (1h to 6h ago)
      // Leads 6-13 are created within the last 7 days
      // Leads 14-25 are created within the last 30 days
      // Leads 26+ are created in 90 days / this year
      this.leads = this.leads.map((l, i) => {
        let offsetHours: number;
        if (i < 6) {
          offsetHours = 1 + i * 0.9; // Today (1h, 1.9h, 2.8h, 3.7h, 4.6h, 5.5h ago)
        } else if (i < 14) {
          offsetHours = 24 + (i - 6) * 16; // Last 7 days (1 to 5 days ago)
        } else if (i < 26) {
          offsetHours = 7 * 24 + (i - 14) * 24; // Last 30 days
        } else if (i < 34) {
          offsetHours = 32 * 24 + (i - 26) * 72; // Last 90 days
        } else {
          offsetHours = 95 * 24 + (i - 34) * 120; // This year
        }
        const created = new Date(now - offsetHours * msHour).toISOString();
        return {
          ...l,
          createdAt: created,
          updatedAt: created,
          lastContactedAt: new Date(now - Math.floor(offsetHours * 0.3 * msHour)).toISOString(),
        };
      });

      // Relative distribution offsets for deals
      this.deals = this.deals.map((d, i) => {
        let createdOffsetDays = 0;
        let closeOffsetDays = 30;
        if (i < 4) {
          createdOffsetDays = 0.2 + i * 0.2; // Today
          closeOffsetDays = 5 + i * 3;
        } else if (i < 12) {
          createdOffsetDays = 1.5 + (i - 4) * 0.7; // Last 7 days
          closeOffsetDays = 7 + (i - 4) * 2;
        } else if (i < 22) {
          createdOffsetDays = 8 + (i - 12) * 2; // Last 30 days
          closeOffsetDays = 20 + (i - 12) * 2;
        } else if (i < 28) {
          createdOffsetDays = 35 + (i - 22) * 5; // Last 90 days
          closeOffsetDays = 50 + (i - 22) * 4;
        } else {
          createdOffsetDays = 95 + (i - 28) * 15; // This year
          closeOffsetDays = 120;
        }
        return {
          ...d,
          createdAt: new Date(now - createdOffsetDays * msDay).toISOString(),
          updatedAt: new Date(now - (createdOffsetDays * 0.5) * msDay).toISOString(),
          expectedCloseDate: new Date(now + closeOffsetDays * msDay).toISOString().split('T')[0],
        };
      });

      // Relative distribution for tasks
      const todayDateStr = new Date(now).toISOString().split('T')[0];
      this.tasks = this.tasks.map((t, i) => {
        let dueOffsetDays = 0;
        let isOverdue = false;
        let taskStatus = t.status;

        if (i < 6) {
          // Due today!
          dueOffsetDays = 0;
          if (taskStatus === 'Completed') taskStatus = 'Pending';
        } else if (i < 10) {
          // Overdue by 1-2 days (urgent pending follow up)
          dueOffsetDays = -(1 + (i - 6) * 0.5);
          isOverdue = true;
          if (taskStatus === 'Completed') taskStatus = 'Pending';
        } else if (i < 20) {
          // Due within next 2-7 days
          dueOffsetDays = 1.5 + (i - 10) * 0.5;
        } else if (i < 35) {
          // Due within next 8-30 days
          dueOffsetDays = 8 + (i - 20) * 1.4;
        } else {
          // Due within next 31-90 days
          dueOffsetDays = 32 + (i - 35) * 3;
        }

        const calculatedDue = dueOffsetDays === 0
          ? todayDateStr
          : new Date(now + dueOffsetDays * msDay).toISOString().split('T')[0];

        return {
          ...t,
          dueDate: calculatedDue,
          status: taskStatus,
          createdAt: new Date(now - (Math.abs(dueOffsetDays) + 2) * msDay).toISOString(),
          updatedAt: new Date(now - 0.5 * msDay).toISOString(),
        };
      });

      // Relative distribution for activities
      const actOffsetsHours = [0.5, 1.5, 3, 5, 20, 48, 96, 160, 300, 600, 1200];
      this.activities = this.activities.map((a, i) => {
        const offset = (actOffsetsHours[i % actOffsetsHours.length] || (i + 1) * 12) * msHour;
        return {
          ...a,
          occurredAt: new Date(now - offset).toISOString(),
        };
      });

      // Relative distribution for contacts & companies
      this.contacts = this.contacts.map((c, i) => {
        const offsetDays = i < 6 ? 0.3 : i < 16 ? 3 : i < 30 ? 18 : 60;
        return {
          ...c,
          createdAt: new Date(now - offsetDays * msDay).toISOString(),
          updatedAt: new Date(now - offsetDays * msDay).toISOString(),
        };
      });

      this.companies = this.companies.map((c, i) => {
        const offsetDays = i < 4 ? 0.2 : i < 12 ? 4 : i < 22 ? 20 : 70;
        return {
          ...c,
          createdAt: new Date(now - offsetDays * msDay).toISOString(),
          updatedAt: new Date(now - offsetDays * msDay).toISOString(),
        };
      });

      try {
        localStorage.setItem('nexus_crm_date_v5', 'v5');
      } catch {}

      this.saveToStorage();
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('nexus_crm_db_state_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.leads && parsed.deals) {
          this.leads = parsed.leads;
          this.deals = parsed.deals;
          this.contacts = parsed.contacts || this.contacts;
          this.companies = parsed.companies || this.companies;
          this.tasks = parsed.tasks || this.tasks;
          this.activities = parsed.activities || this.activities;
          this.users = parsed.users || this.users;
          this.pipelineStages = parsed.pipelineStages || this.pipelineStages;
          this.customFields = parsed.customFields || this.customFields;
          this.activeOrganizationId = parsed.activeOrganizationId || this.activeOrganizationId;
        }
      }
    } catch {
      // Ignore storage errors in restricted sandbox environments
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('nexus_crm_db_state_v1', JSON.stringify({
        leads: this.leads,
        deals: this.deals,
        contacts: this.contacts,
        companies: this.companies,
        tasks: this.tasks,
        activities: this.activities,
        users: this.users,
        pipelineStages: this.pipelineStages,
        customFields: this.customFields,
        activeOrganizationId: this.activeOrganizationId,
      }));
    } catch {
      // Storage unavailable or quota exceeded
    }
  }

  public resetToDefaults() {
    this.users = [...MOCK_USERS];
    this.companies = [...MOCK_COMPANIES];
    this.contacts = [...MOCK_CONTACTS];
    this.leads = [...MOCK_LEADS];
    this.deals = [...MOCK_DEALS];
    this.tasks = [...MOCK_TASKS];
    this.activities = [...MOCK_ACTIVITIES];
    this.organizations = [...MOCK_ORGANIZATIONS];
    this.pipelineStages = [...MOCK_PIPELINE_STAGES];
    this.customFields = [...MOCK_CUSTOM_FIELDS];
    this.activeOrganizationId = 'org_nexus_01';
    this.saveToStorage();
  }

  public getActiveOrganizationId(): string {
    return this.activeOrganizationId;
  }

  public setActiveOrganizationId(orgId: string): void {
    this.activeOrganizationId = orgId;
    this.saveToStorage();
  }

  public getOrganizations(): Organization[] {
    return [...this.organizations];
  }

  // --- LEADS ---
  public getLeads(): Lead[] {
    return this.leads.filter(l => l.organizationId === this.activeOrganizationId);
  }

  public getLeadById(id: string): Lead | undefined {
    return this.leads.find(l => l.id === id);
  }

  public createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'organizationId'>): Lead {
    const newLead: Lead = {
      ...leadData,
      id: `lead_${Date.now()}`,
      organizationId: this.activeOrganizationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.leads.unshift(newLead);
    this.saveToStorage();
    return newLead;
  }

  public updateLead(id: string, updates: Partial<Lead>): Lead {
    const idx = this.leads.findIndex(l => l.id === id);
    if (idx === -1) throw new Error(`Lead with id ${id} not found`);
    this.leads[idx] = {
      ...this.leads[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage();
    return this.leads[idx];
  }

  public deleteLead(id: string): void {
    this.leads = this.leads.filter(l => l.id !== id);
    this.saveToStorage();
  }

  public convertLead(leadId: string, options: { createDeal?: boolean; dealValue?: number; dealName?: string }): {
    contact: Contact;
    company: Company;
    deal?: Deal;
  } {
    const lead = this.getLeadById(leadId);
    if (!lead) throw new Error('Lead not found');

    // 1. Create or find Company
    let company = this.companies.find(c => c.name.toLowerCase() === lead.companyName.toLowerCase());
    if (!company) {
      company = {
        id: `comp_${Date.now()}`,
        organizationId: this.activeOrganizationId,
        name: lead.companyName,
        industry: 'Enterprise Technology',
        website: `https://${lead.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        phone: lead.phone,
        email: lead.email,
        location: lead.location || 'Bengaluru, Karnataka',
        employees: '100-500',
        ownerId: lead.ownerId,
        ownerName: lead.ownerName,
        status: 'Prospect',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.companies.unshift(company);
    }

    // 2. Create Contact
    const contact: Contact = {
      id: `cnt_${Date.now()}`,
      organizationId: this.activeOrganizationId,
      name: lead.name,
      companyId: company.id,
      companyName: company.name,
      email: lead.email,
      phone: lead.phone,
      jobTitle: lead.title || 'Executive Decision Maker',
      ownerId: lead.ownerId,
      ownerName: lead.ownerName,
      lastActivityAt: new Date().toISOString(),
      status: 'Active',
      location: lead.location,
      notes: `Converted from Lead ${lead.name}. AI Lead score was ${lead.leadScore}/100.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.contacts.unshift(contact);

    // 3. Optional Deal
    let deal: Deal | undefined;
    if (options.createDeal) {
      deal = {
        id: `deal_${Date.now()}`,
        organizationId: this.activeOrganizationId,
        name: options.dealName || `${company.name} CRM Modernization`,
        companyId: company.id,
        companyName: company.name,
        contactId: contact.id,
        contactName: contact.name,
        value: options.dealValue || lead.estimatedValue || 800000,
        stage: 'Qualified',
        probability: 40,
        ownerId: lead.ownerId,
        ownerName: lead.ownerName,
        expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.deals.unshift(deal);
    }

    // 4. Update lead status
    this.updateLead(leadId, {
      status: 'Converted',
      convertedContactId: contact.id,
      convertedCompanyId: company.id,
      convertedDealId: deal?.id,
    });

    // 5. Add Activity
    this.createActivity({
      type: 'Note',
      title: `Lead Converted: ${lead.name}`,
      description: `Prospect converted into account record. Created contact ${contact.name}${deal ? ` and deal ${deal.name}` : ''}.`,
      performedById: lead.ownerId,
      performedByName: lead.ownerName,
      occurredAt: new Date().toISOString(),
      relatedLeadId: lead.id,
      relatedLeadName: lead.name,
      relatedContactId: contact.id,
      relatedContactName: contact.name,
      relatedCompanyId: company.id,
      relatedCompanyName: company.name,
      relatedDealId: deal?.id,
      relatedDealName: deal?.name,
    });

    this.saveToStorage();
    return { contact, company, deal };
  }

  // --- CONTACTS ---
  public getContacts(): Contact[] {
    return this.contacts.filter(c => c.organizationId === this.activeOrganizationId);
  }

  public getContactById(id: string): Contact | undefined {
    return this.contacts.find(c => c.id === id);
  }

  public createContact(data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'organizationId'>): Contact {
    const newContact: Contact = {
      ...data,
      id: `cnt_${Date.now()}`,
      organizationId: this.activeOrganizationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.contacts.unshift(newContact);
    this.saveToStorage();
    return newContact;
  }

  public updateContact(id: string, updates: Partial<Contact>): Contact {
    const idx = this.contacts.findIndex(c => c.id === id);
    if (idx === -1) throw new Error(`Contact with id ${id} not found`);
    this.contacts[idx] = {
      ...this.contacts[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage();
    return this.contacts[idx];
  }

  public deleteContact(id: string): void {
    this.contacts = this.contacts.filter(c => c.id !== id);
    this.saveToStorage();
  }

  // --- COMPANIES ---
  public getCompanies(): Company[] {
    return this.companies.filter(c => c.organizationId === this.activeOrganizationId);
  }

  public getCompanyById(id: string): Company | undefined {
    return this.companies.find(c => c.id === id);
  }

  public createCompany(data: Omit<Company, 'id' | 'createdAt' | 'updatedAt' | 'organizationId'>): Company {
    const newCompany: Company = {
      ...data,
      id: `comp_${Date.now()}`,
      organizationId: this.activeOrganizationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.companies.unshift(newCompany);
    this.saveToStorage();
    return newCompany;
  }

  public updateCompany(id: string, updates: Partial<Company>): Company {
    const idx = this.companies.findIndex(c => c.id === id);
    if (idx === -1) throw new Error(`Company with id ${id} not found`);
    this.companies[idx] = {
      ...this.companies[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage();
    return this.companies[idx];
  }

  public deleteCompany(id: string): void {
    this.companies = this.companies.filter(c => c.id !== id);
    this.saveToStorage();
  }

  // --- DEALS ---
  public getDeals(): Deal[] {
    return this.deals.filter(d => d.organizationId === this.activeOrganizationId);
  }

  public getDealById(id: string): Deal | undefined {
    return this.deals.find(d => d.id === id);
  }

  public createDeal(data: Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'organizationId'>): Deal {
    const newDeal: Deal = {
      ...data,
      id: `deal_${Date.now()}`,
      organizationId: this.activeOrganizationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.deals.unshift(newDeal);
    this.saveToStorage();
    return newDeal;
  }

  public updateDeal(id: string, updates: Partial<Deal>): Deal {
    const idx = this.deals.findIndex(d => d.id === id);
    if (idx === -1) throw new Error(`Deal with id ${id} not found`);
    this.deals[idx] = {
      ...this.deals[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage();
    return this.deals[idx];
  }

  public deleteDeal(id: string): void {
    this.deals = this.deals.filter(d => d.id !== id);
    this.saveToStorage();
  }

  // --- TASKS ---
  public getTasks(): Task[] {
    return this.tasks.filter(t => t.organizationId === this.activeOrganizationId);
  }

  public getTaskById(id: string): Task | undefined {
    return this.tasks.find(t => t.id === id);
  }

  public createTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'organizationId'>): Task {
    const newTask: Task = {
      ...data,
      id: `tsk_${Date.now()}`,
      organizationId: this.activeOrganizationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tasks.unshift(newTask);
    this.saveToStorage();
    return newTask;
  }

  public updateTask(id: string, updates: Partial<Task>): Task {
    const idx = this.tasks.findIndex(t => t.id === id);
    if (idx === -1) throw new Error(`Task with id ${id} not found`);
    this.tasks[idx] = {
      ...this.tasks[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage();
    return this.tasks[idx];
  }

  public deleteTask(id: string): void {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.saveToStorage();
  }

  // --- ACTIVITIES ---
  public getActivities(): Activity[] {
    return this.activities.filter(a => a.organizationId === this.activeOrganizationId);
  }

  public createActivity(data: Omit<Activity, 'id' | 'organizationId'>): Activity {
    const newAct: Activity = {
      ...data,
      id: `act_${Date.now()}`,
      organizationId: this.activeOrganizationId,
    };
    this.activities.unshift(newAct);
    this.saveToStorage();
    return newAct;
  }

  // --- USERS ---
  public getUsers(): User[] {
    return this.users.filter(u => u.organizationId === this.activeOrganizationId);
  }

  public getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  // --- PIPELINE & CUSTOM FIELDS ---
  public getPipelineStages(): PipelineStageConfig[] {
    return [...this.pipelineStages];
  }

  public updatePipelineStages(stages: PipelineStageConfig[]): void {
    this.pipelineStages = [...stages];
    this.saveToStorage();
  }

  public getCustomFields(): CustomFieldConfig[] {
    return [...this.customFields];
  }

  public addCustomField(field: Omit<CustomFieldConfig, 'id'>): CustomFieldConfig {
    const newF: CustomFieldConfig = {
      ...field,
      id: `cf_${Date.now()}`,
    };
    this.customFields.push(newF);
    this.saveToStorage();
    return newF;
  }

  // --- KPI CALCULATION ---
  public getDashboardKpis(dateRange: string = '30 Days'): DashboardKpiSummary {
    const formatLakhs = (amount: number) => {
      const inLakhs = (amount / 100000).toFixed(1);
      return `₹${inLakhs}L`;
    };

    const totalLeads = 1248; // Baseline enterprise figure (All Leads: 1,248)
    let newLeads = 186;
    let openDeals = 48;
    let pipelineValue = 4280000;
    let wonRevenue = 1840000;
    let conversionRate = 23.6;
    let leadGrowthPercent = 14.8;
    let revenueGrowthPercent = 22.4;

    switch (dateRange) {
      case 'Today':
        newLeads = 12;
        openDeals = 9;
        pipelineValue = 950000;
        wonRevenue = 320000;
        conversionRate = 28.5;
        leadGrowthPercent = 6.4;
        revenueGrowthPercent = 11.2;
        break;
      case '7 Days':
        newLeads = 56;
        openDeals = 28;
        pipelineValue = 2140000;
        wonRevenue = 860000;
        conversionRate = 26.4;
        leadGrowthPercent = 18.2;
        revenueGrowthPercent = 19.5;
        break;
      case '30 Days':
        newLeads = 186;
        openDeals = 74;
        pipelineValue = 4280000;
        wonRevenue = 1840000;
        conversionRate = 23.6;
        leadGrowthPercent = 14.8;
        revenueGrowthPercent = 22.4;
        break;
      case '90 Days':
        newLeads = 440;
        openDeals = 116;
        pipelineValue = 8850000;
        wonRevenue = 4920000;
        conversionRate = 24.8;
        leadGrowthPercent = 28.5;
        revenueGrowthPercent = 31.0;
        break;
      case 'This Year':
        newLeads = 712;
        openDeals = 158;
        pipelineValue = 14850000;
        wonRevenue = 9450000;
        conversionRate = 25.2;
        leadGrowthPercent = 42.0;
        revenueGrowthPercent = 48.6;
        break;
    }

    return {
      totalLeads,
      newLeads,
      openDeals,
      pipelineValue,
      wonRevenue,
      conversionRate,
      leadGrowthPercent,
      revenueGrowthPercent,
      pipelineValueFormatted: formatLakhs(pipelineValue),
      wonRevenueFormatted: formatLakhs(wonRevenue),
    };
  }

  exportFullDatabase() {
    return {
      activeOrganizationId: this.activeOrganizationId,
      leads: this.leads,
      deals: this.deals,
      contacts: this.contacts,
      companies: this.companies,
      tasks: this.tasks,
      activities: this.activities,
      users: this.users,
      customFields: this.customFields,
      pipelineStages: this.pipelineStages,
    };
  }
}

export const mockDb = new MockDatabase();
