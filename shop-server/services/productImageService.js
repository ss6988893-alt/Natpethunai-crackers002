import mongoose from 'mongoose';
import sharp from 'sharp';

const bucket = () => new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'productImages' });

const publicImageUrl = (request, id) => {
  const configuredOrigin = String(process.env.PUBLIC_API_URL || '').replace(/\/$/, '');
  const origin = configuredOrigin || `${request.protocol}://${request.get('host')}`;
  return `${origin}/api/product-images/${id}`;
};

const uploadBuffer = (buffer, filename) => new Promise((resolve, reject) => {
  const stream = bucket().openUploadStream(filename, {
    contentType: 'image/webp',
    metadata: { contentType: 'image/webp' },
  });
  stream.once('error', reject);
  stream.once('finish', () => resolve(stream.id));
  stream.end(buffer);
});

export async function saveProductImages(files = [], request) {
  return Promise.all(files.map(async (file) => {
    const buffer = await sharp(file.buffer)
      .rotate()
      .resize(1400, 1400, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    const id = await uploadBuffer(buffer, `${Date.now()}-${file.originalname}.webp`);
    return publicImageUrl(request, id);
  }));
}

export async function serveProductImage(request, response) {
  if (!mongoose.isValidObjectId(request.params.id)) return response.status(404).end();
  const id = new mongoose.Types.ObjectId(request.params.id);
  const file = await bucket().find({ _id: id }).next();
  if (!file) return response.status(404).end();
  response.set({
    'Content-Type': file.contentType || file.metadata?.contentType || 'image/webp',
    'Cache-Control': 'public, max-age=2592000, immutable',
  });
  return bucket().openDownloadStream(id).pipe(response);
}

export async function deleteProductImages(urls = []) {
  const ids = urls.map((url) => String(url).match(/\/api\/product-images\/([a-f\d]{24})$/i)?.[1]).filter(Boolean);
  await Promise.all(ids.map(async (value) => {
    try { await bucket().delete(new mongoose.Types.ObjectId(value)); } catch (error) {
      if (error.code !== 'ENOENT') console.error('Unable to remove product image', error);
    }
  }));
}
