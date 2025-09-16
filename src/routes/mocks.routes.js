import { Router } from 'express';
import { generateMockUsers, generateMockProducts, insertMockData, resetMockData } from '../utils/mocking.js';
import { requireAdmin } from '../middlewares/role.middleware.js';

export const mocksRouter = Router();


mocksRouter.get('/mockingproducts', requireAdmin, async (req, res) => {
  try {
    const products = generateMockProducts(50);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error generating mock products', details: error.message });
  }
});


mocksRouter.get('/mockingusers', requireAdmin, async (req, res) => {
  try {
    const users = await generateMockUsers(50);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error generating mock users', details: error.message });
  }
});


mocksRouter.post('/generateData', requireAdmin, async (req, res) => {
  try {
    const { users = 0, products = 0 } = req.body;
    if (users < 0 || products < 0) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    const result = await insertMockData({ users, products });
    res.json({
      message: 'Data generated and inserted successfully',
      users: result.users,
      products: result.products
    });
  } catch (error) {
    res.status(500).json({ error: 'Error inserting mock data', details: error.message });
  }
});

mocksRouter.delete('/reset', requireAdmin, async (req, res) => {
  try {
    const result = await resetMockData();
    res.json({
      message: 'Mock data reset successfully',
      deleted: result
    });
  } catch (error) {
    res.status(500).json({ error: 'Error resetting mock data', details: error.message });
  }
});