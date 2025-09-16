import { Router } from 'express';
import { userModel } from '../models/user.model.js';
import { requireAdmin } from '../middlewares/role.middleware.js';

export const usersRouter = Router();


usersRouter.get('/', requireAdmin, async (req, res) => {
  try {
    const users = await userModel.find().lean();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users', details: error.message });
  }
});