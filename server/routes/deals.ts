import { Router, Response } from 'express';
import { Deal } from '../models';
import { validateBody } from '../validators/validate';
import {
  createDealSchema,
  updateDealSchema,
  updateDealStageSchema,
} from '../validators/crmValidators';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

/**
 * GET /api/deals
 */
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId || 'org_inbox_01';
    const { stage, search } = req.query;

    const query: any = { organizationId: orgId };
    if (stage && stage !== 'All') {
      query.stage = stage;
    }
    if (search && typeof search === 'string' && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { companyName: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const deals = await Deal.find(query).sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: deals,
      meta: { total: deals.length },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/deals/:id
 */
router.get('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId || 'org_inbox_01';
    const deal = await Deal.findOne({ id: req.params.id, organizationId: orgId });
    if (!deal) {
      res.status(404).json({ success: false, message: 'Deal not found.' });
      return;
    }
    res.json({ success: true, data: deal });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/deals
 */
router.post(
  '/',
  validateBody(createDealSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const orgId = req.user?.organizationId || 'org_inbox_01';
      const id = `deal_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

      const newDeal = await Deal.create({
        ...req.body,
        id,
        organizationId: orgId,
        ownerId: req.user?.id || 'usr_1',
        ownerName: req.user?.name || 'Administrator',
      });

      res.status(201).json({
        success: true,
        data: newDeal,
        message: 'Deal created successfully.',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/**
 * PUT /api/deals/:id
 */
router.put(
  '/:id',
  validateBody(updateDealSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const orgId = req.user?.organizationId || 'org_inbox_01';
      const updated = await Deal.findOneAndUpdate(
        { id: req.params.id, organizationId: orgId },
        { ...req.body },
        { new: true, runValidators: true }
      );

      if (!updated) {
        res.status(404).json({ success: false, message: 'Deal not found.' });
        return;
      }

      res.json({ success: true, data: updated, message: 'Deal updated successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/**
 * PATCH /api/deals/:id/stage
 * Rapid Kanban stage progression with probability sync.
 */
router.patch(
  '/:id/stage',
  validateBody(updateDealStageSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const orgId = req.user?.organizationId || 'org_inbox_01';
      const { stage, probability } = req.body;

      const defaultProbabilities: Record<string, number> = {
        New: 10,
        Qualified: 30,
        Proposal: 60,
        Negotiation: 75,
        Won: 100,
        Lost: 0,
      };

      const finalProb = typeof probability === 'number' ? probability : defaultProbabilities[stage] ?? 50;

      const updated = await Deal.findOneAndUpdate(
        { id: req.params.id, organizationId: orgId },
        { stage, probability: finalProb },
        { new: true }
      );

      if (!updated) {
        res.status(404).json({ success: false, message: 'Deal not found.' });
        return;
      }

      res.json({
        success: true,
        data: updated,
        message: `Deal stage updated to "${stage}".`,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/**
 * DELETE /api/deals/:id
 */
router.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId || 'org_inbox_01';
    const result = await Deal.deleteOne({ id: req.params.id, organizationId: orgId });

    if (result.deletedCount === 0) {
      res.status(404).json({ success: false, message: 'Deal not found.' });
      return;
    }

    res.json({ success: true, data: null, message: 'Deal deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

