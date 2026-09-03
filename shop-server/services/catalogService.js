import Combo from '../models/Combo.js';
import Product from '../models/Product.js';

export async function priceItems(requestedItems) {
  const lines = [];
  for (const requested of requestedItems) {
    const Model = requested.itemType === 'combo' ? Combo : Product;
    const record = await Model.findOne({ slug: requested.slug }).populate(requested.itemType === 'product' ? 'category' : []).lean();
    if (!record || record.status === 'out-of-stock' || record.status === 'inactive') {
      const error = new Error(`${requested.slug} is unavailable.`); error.status = 409; throw error;
    }
    const price = Number(record.price);
    lines.push({ sourceType: requested.itemType, sourceId: record._id, slug: record.slug, name: record.name, category: requested.itemType === 'combo' ? 'Combo Packs' : record.category?.name || 'Crackers', image: record.image, price, quantity: requested.quantity, subtotal: price * requested.quantity });
  }
  const subtotal = lines.reduce((sum, item) => sum + item.subtotal, 0);
  return { lines, subtotal, discount: 0, total: subtotal };
}
