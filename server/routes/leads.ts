import { Router, Response } from 'express';
import { Lead, Contact, Deal } from '../models';
import { validateBody } from '../validators/validate';
import { createLeadSchema, updateLeadSchema } from '../validators/crmValidators';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Apply auth to all lead routes
router.use(authenticateToken);

/**
 * GET /api/leads
 * Query leads with search, filtering, and pagination.
 */
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId || 'org_inbox_01';
    const { status, source, search, page = '1', pageSize = '50' } = req.query;

    const query: any = { organizationId: orgId };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (source && source !== 'All') {
      query.source = source;
    }

    if (search && typeof search === 'string' && search.trim()) {
      const term = search.trim();
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { companyName: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
      ];
    }

    const p = Math.max(1, parseInt(page as string, 10));
    const limit = Math.max(1, parseInt(pageSize as string, 10));
    const skip = (p - 1) * limit;

    const [leads, total] = await Promise.all([
      Lead.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Lead.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: leads,
      meta: {
        total,
        page: p,
        pageSize: limit,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/leads/:id
 */
router.get('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId || 'org_inbox_01';
    const lead = await Lead.findOne({ id: req.params.id, organizationId: orgId });

    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found.' });
      return;
    }

    res.json({ success: true, data: lead });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/leads
 * Creates a new lead with strong Zod validation.
 */
router.post(
  '/',
  validateBody(createLeadSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const orgId = req.user?.organizationId || 'org_inbox_01';
      const id = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

      const newLead = await Lead.create({
        ...req.body,
        id,
        organizationId: orgId,
        ownerId: req.user?.id || 'usr_1',
        ownerName: req.user?.name || 'Administrator',
      });

      res.status(201).json({
        success: true,
        data: newLead,
        message: 'Lead created successfully.',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/**
 * PUT /api/leads/:id
 * Updates an existing lead with validation.
 */
router.put(
  '/:id',
  validateBody(updateLeadSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const orgId = req.user?.organizationId || 'org_inbox_01';
      const updated = await Lead.findOneAndUpdate(
        { id: req.params.id, organizationId: orgId },
        { ...req.body },
        { new: true, runValidators: true }
      );

      if (!updated) {
        res.status(404).json({ success: false, message: 'Lead not found.' });
        return;
      }

      res.json({
        success: true,
        data: updated,
        message: 'Lead updated successfully.',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/**
 * POST /api/leads/:id/convert
 * 1-Click Lead Conversion Workflow into Contact and Deal.
 */
router.post('/:id/convert', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId || 'org_inbox_01';
    const lead = await Lead.findOne({ id: req.params.id, organizationId: orgId });

    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found.' });
      return;
    }

    if (lead.status === 'Converted') {
      res.status(400).json({ success: false, message: 'This lead has already been converted.' });
      return;
    }

    const { dealName, dealValue, dealStage = 'New', closeDate } = req.body;

    const contactId = `cnt_${Date.now()}`;
    const dealId = `deal_${Date.now()}`;
    const now = new Date().toISOString();

    // 1. Create Contact
    const contact = await Contact.create({
      id: contactId,
      organizationId: orgId,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      companyId: lead.convertedCompanyId || 'comp_1',
      companyName: lead.companyName,
      jobTitle: lead.title || 'Decision Maker',
      status: 'Active',
      notes: `Converted from lead "${lead.name}". Lead Notes: ${lead.notes || 'None'}`,
    });

    // 2. Create Deal
    const deal = await Deal.create({
      id: dealId,
      organizationId: orgId,
      name: dealName || `${lead.companyName} - Opportunity`,
      companyId: contact.companyId,
      companyName: lead.companyName,
      contactId: contact.id,
      contactName: lead.name,
      value: typeof dealValue === 'number' ? dealValue : lead.estimatedValue || 500000,
      stage: dealStage,
      probability: dealStage === 'Proposal' ? 60 : dealStage === 'Qualified' ? 30 : 10,
      expectedCloseDate: closeDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      ownerId: lead.ownerId,
      ownerName: lead.ownerName,
      notes: `Generated via 1-click lead conversion from ${lead.email}`,
    });

    // 3. Mark Lead as Converted
    lead.status = 'Converted';
    lead.convertedContactId = contact.id;
    lead.convertedDealId = deal.id;
    await lead.save();

    res.json({
      success: true,
      data: {
        lead,
        contact,
        deal,
      },
      message: `Lead "${lead.name}" successfully converted to Contact and Deal!`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/leads/:id
 */
router.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId || 'org_inbox_01';
    const result = await Lead.deleteOne({ id: req.params.id, organizationId: orgId });

    if (result.deletedCount === 0) {
      res.status(404).json({ success: false, message: 'Lead not found.' });
      return;
    }

    res.json({ success: true, data: null, message: 'Lead deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

