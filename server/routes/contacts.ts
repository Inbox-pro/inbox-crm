import { Router, Response } from 'express';
import { Contact } from '../models';
import { validateBody } from '../validators/validate';
import { createContactSchema } from '../validators/crmValidators';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId || 'org_inbox_01';
    const contacts = await Contact.find({ organizationId: orgId }).sort({ createdAt: -1 });
    res.json({ success: true, data: contacts, meta: { total: contacts.length } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post(
  '/',
  validateBody(createContactSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const orgId = req.user?.organizationId || 'org_inbox_01';
      const id = `cnt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const contact = await Contact.create({
        ...req.body,
        id,
        organizationId: orgId,
      });
      res.status(201).json({ success: true, data: contact, message: 'Contact created successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

router.put('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId || 'org_inbox_01';
    const contact = await Contact.findOneAndUpdate(
      { id: req.params.id, organizationId: orgId },
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!contact) {
      res.status(404).json({ success: false, message: 'Contact not found.' });
      return;
    }
    res.json({ success: true, data: contact, message: 'Contact updated.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId || 'org_inbox_01';
    await Contact.deleteOne({ id: req.params.id, organizationId: orgId });
    res.json({ success: true, data: null, message: 'Contact deleted.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

