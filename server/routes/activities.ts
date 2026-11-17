import { Router, Response } from 'express';
import { Activity } from '../models';
import { validateBody } from '../validators/validate';
import { createActivitySchema } from '../validators/crmValidators';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId || 'org_inbox_01';
    const { type } = req.query;
    const query: any = { organizationId: orgId };
    if (type && type !== 'All') {
      query.type = type;
    }

    const activities = await Activity.find(query).sort({ occurredAt: -1 }).limit(100);
    res.json({ success: true, data: activities, meta: { total: activities.length } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post(
  '/',
  validateBody(createActivitySchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const orgId = req.user?.organizationId || 'org_inbox_01';
      const id = `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const activity = await Activity.create({
        ...req.body,
        id,
        organizationId: orgId,
        performedByName: req.user?.name || 'Administrator',
        performedById: req.user?.id || 'usr_1',
        occurredAt: req.body.occurredAt || new Date().toISOString(),
      });
      res.status(201).json({ success: true, data: activity, message: 'Activity logged.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

export default router;

