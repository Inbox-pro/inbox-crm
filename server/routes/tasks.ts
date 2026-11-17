import { Router, Response } from 'express';
import { Task } from '../models';
import { validateBody } from '../validators/validate';
import { createTaskSchema } from '../validators/crmValidators';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId || 'org_inbox_01';
    const tasks = await Task.find({ organizationId: orgId }).sort({ dueDate: 1 });
    res.json({ success: true, data: tasks, meta: { total: tasks.length } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post(
  '/',
  validateBody(createTaskSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const orgId = req.user?.organizationId || 'org_inbox_01';
      const id = `tsk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const task = await Task.create({
        ...req.body,
        id,
        organizationId: orgId,
        assignedToName: req.body.assignedToName || req.user?.name || 'Administrator',
        assignedToId: req.body.assignedToId || req.user?.id || 'usr_1',
      });
      res.status(201).json({ success: true, data: task, message: 'Task created successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

router.patch('/:id/toggle', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId || 'org_inbox_01';
    const task = await Task.findOne({ id: req.params.id, organizationId: orgId });
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found.' });
      return;
    }

    const isNowCompleted = task.status !== 'Completed';
    task.status = isNowCompleted ? 'Completed' : 'Pending';
    task.completedAt = isNowCompleted ? new Date().toISOString() : undefined;
    await task.save();

    res.json({ success: true, data: task, message: `Task marked as ${task.status}.` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId || 'org_inbox_01';
    const task = await Task.findOneAndUpdate(
      { id: req.params.id, organizationId: orgId },
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found.' });
      return;
    }
    res.json({ success: true, data: task, message: 'Task updated.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId || 'org_inbox_01';
    await Task.deleteOne({ id: req.params.id, organizationId: orgId });
    res.json({ success: true, data: null, message: 'Task deleted.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

