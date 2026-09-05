import axios from 'axios';
import { categories, combos, products } from '../data/catalog';

const http = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', timeout: 20000, withCredentials: true });
const adminTokenKey = 'natpe_thunai_admin_token';

http.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(adminTokenKey);
  if (token && String(config.url || '').startsWith('/admin/')) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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
export const adminApi = {
  login: (payload) => http.post('/admin/auth/login', payload).then((response) => {
    if (response.data.token) sessionStorage.setItem(adminTokenKey, response.data.token);
    return response.data;
  }),
  logout: () => http.post('/admin/auth/logout').then((response) => response.data).finally(() => sessionStorage.removeItem(adminTokenKey)),
  me: () => http.get('/admin/auth/me').then((response) => response.data),
  dashboard: (params) => http.get('/admin/dashboard', { params }).then((response) => response.data),
  analytics: (params) => http.get('/admin/analytics', { params }).then((response) => response.data),
  products: (params) => http.get('/admin/products', { params }).then((response) => response.data),
  createProduct: (data) => http.post('/admin/products', data).then((response) => response.data),
  updateProduct: (id, data) => http.put(`/admin/products/${id}`, data).then((response) => response.data),
  deleteProduct: (id) => http.delete(`/admin/products/${id}`).then((response) => response.data),
  categories: () => http.get('/admin/categories').then((response) => response.data),
  createCategory: (data) => http.post('/admin/categories', data).then((response) => response.data),
  updateCategory: (id, data) => http.put(`/admin/categories/${id}`, data).then((response) => response.data),
  deleteCategory: (id) => http.delete(`/admin/categories/${id}`).then((response) => response.data),
  orders: (params) => http.get('/admin/orders', { params }).then((response) => response.data),
  order: (id) => http.get(`/admin/orders/${id}`).then((response) => response.data),
  updateOrderStatus: (id, status) => http.put(`/admin/orders/${id}/status`, { status }).then((response) => response.data),
  customers: (params) => http.get('/admin/customers', { params }).then((response) => response.data),
  notifications: () => http.get('/admin/notifications').then((response) => response.data),
  readNotification: (id) => http.put(`/admin/notifications/${id}/read`).then((response) => response.data),
};

export default http;
