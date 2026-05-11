import { Router } from 'express';
import * as customerService from '../services/customerService';
import { logAudit } from '../services/auditService';

const router = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const rawName = (req.body as { name?: unknown }).name;
  const rawEmail = (req.body as { email?: unknown }).email;

  const name = typeof rawName === 'string' ? rawName.trim() : '';
  const email = typeof rawEmail === 'string' ? rawEmail.trim() : '';

  if (!name || name.length > 100) {
    return res.status(400).json({ error: 'name is required and must be 1-100 characters' });
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'email is invalid' });
  }

  const customer = await customerService.createCustomer({ name, email });
  logAudit(customer.id, 'CREATE', { name, email }).catch((e) =>
    console.error('Audit log failed:', e),
  );
  res.status(201).json(customer);
});

router.delete('/:id', async (req, res) => {
  const deleted = await customerService.deleteCustomer(Number(req.params.id));
  if (!deleted) return res.status(404).json({ error: 'Customer not found' });
  res.status(204).send();
});

export default router;
