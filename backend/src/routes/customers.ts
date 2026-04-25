import { Router } from 'express';
import * as customerService from '../services/customerService';
import { logAudit } from '../services/auditService';

// Topic 11: REST — HTTP verbs map to CRUD (GET=READ, POST=INSERT, DELETE=DELETE)
const router = Router();

router.get('/', async (_req, res) => {
  const customers = await customerService.getAllCustomers();
  res.json(customers);
});

router.get('/:id', async (req, res) => {
  const customer = await customerService.getCustomerById(Number(req.params.id));
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  res.json(customer);
});

router.post('/', async (req, res) => {
  const { name, email } = req.body as { name?: string; email?: string };
  if (!name || !email) return res.status(400).json({ error: 'name and email are required' });

  const customer = await customerService.createCustomer({ name, email });
  // Fire-and-forget audit log to DynamoDB — does not block the REST response
  logAudit(customer.id, 'CREATE', { name, email }).catch(console.warn);
  res.status(201).json(customer);
});

router.delete('/:id', async (req, res) => {
  const deleted = await customerService.deleteCustomer(Number(req.params.id));
  if (!deleted) return res.status(404).json({ error: 'Customer not found' });
  res.status(204).send();
});

export default router;
