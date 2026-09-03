import { z } from 'zod';

const text = (min, max) => z.string().trim().min(min).max(max);
const mobile = z.string().trim().regex(/^(?:\+91[ -]?|0)?[6-9]\d{9}$/, 'Enter a valid Indian mobile number');
const email = z.union([z.literal(''), z.email()]).optional();

export const orderSchema = z.object({ body: z.object({
  customer: z.object({
    name: text(2, 100), mobile, email, address: text(5, 300), city: text(2, 80),
    district: z.string().trim().max(80).optional().default(''), state: z.string().trim().max(80).optional().default('Tamil Nadu'),
    pincode: z.string().trim().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'), notes: z.string().trim().max(1000).optional().default(''),
  }),
  items: z.array(z.object({ slug: text(1, 160), itemType: z.enum(['product', 'combo']), quantity: z.coerce.number().int().min(1).max(100) })).min(1).max(200),
}), params: z.object({}).optional(), query: z.object({}).optional() });

export const estimateSchema = z.object({ body: z.object({
  customer: z.object({ name: z.string().trim().max(100).optional().default('Customer'), mobile: z.string().trim().max(20).optional().default('') }).optional().default({ name: 'Customer', mobile: '' }),
  items: z.array(z.object({ slug: text(1, 160), itemType: z.enum(['product', 'combo']), quantity: z.coerce.number().int().min(1).max(100) })).min(1).max(200),
}), params: z.object({}).optional(), query: z.object({}).optional() });

export const contactSchema = z.object({ body: z.object({
  name: text(2, 100), mobile, email, subject: text(3, 160), message: text(10, 3000),
}), params: z.object({}).optional(), query: z.object({}).optional() });
