import { Router, Response } from 'express';
import { Company } from '../models';
import { validateBody } from '../validators/validate';
import { createCompanySchema } from '../validators/crmValidators';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId || 'org_inbox_01';
    const companies = await Company.find({ organizationId: orgId }).sort({ createdAt: -1 });
    res.json({ success: true, data: companies, meta: { total: companies.length } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post(
  '/',
  validateBody(createCompanySchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const orgId = req.user?.organizationId || 'org_inbox_01';
      const id = `comp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const company = await Company.create({
        ...req.body,
        id,
        organizationId: orgId,
      });
      res.status(201).json({ success: true, data: company, message: 'Company account created.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

router.put('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId || 'org_inbox_01';
    const company = await Company.findOneAndUpdate(
      { id: req.params.id, organizationId: orgId },
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!company) {
      res.status(404).json({ success: false, message: 'Company not found.' });
      return;
    }
    res.json({ success: true, data: company, message: 'Company updated.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId || 'org_inbox_01';
    await Company.deleteOne({ id: req.params.id, organizationId: orgId });
    res.json({ success: true, data: null, message: 'Company deleted.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

