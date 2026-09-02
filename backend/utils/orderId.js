import Counter from '../models/Counter.js';

export async function createOrderId() {
  const year = new Date().getFullYear();
  const counter = await Counter.findByIdAndUpdate(`order-${year}`, { $inc: { sequence: 1 } }, { new: true, upsert: true, setDefaultsOnInsert: true });
  return `ORD-${year}-${String(counter.sequence).padStart(6, '0')}`;
}
