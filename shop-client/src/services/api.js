import axios from 'axios';
import { categories, combos, products } from '../data/catalog';

const http = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', timeout: 12000 });

const fallback = (data) => ({ data, demo: true });

export async function getProducts(params = {}) {
  try { return (await http.get('/products', { params })).data; }
  catch { return fallback(products); }
}

export async function getCategories() {
  try { return (await http.get('/categories')).data; }
  catch { return fallback(categories); }
}

export async function getCombos() {
  try { return (await http.get('/combos')).data; }
  catch { return fallback(combos); }
}

export const submitOrder = (payload) => http.post('/orders', payload).then((response) => response.data);
export const submitEnquiry = (payload) => http.post('/contact', payload).then((response) => response.data);
export const orderPdfUrl = (orderId) => `${http.defaults.baseURL}/orders/${encodeURIComponent(orderId)}/pdf`;

export default http;
