import mongoose from 'mongoose';

// Keep the catalogue identity after deletion so startup imports cannot restore it.
const deletedCatalogProductSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  sourceNumber: { type: String, index: true },
}, { timestamps: true });

export default mongoose.model('DeletedCatalogProduct', deletedCatalogProductSchema);
