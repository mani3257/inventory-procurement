import api from '../api/axios';

export const getProducts = () => api.get('/products').then((res) => res.data);
export const getProductById = (id) => api.get('/products/' + id).then((res) => res.data);
export const getLowStockProducts = () => api.get('/products/low-stock').then((res) => res.data);
export const createProduct = (payload) => api.post('/products', payload).then((res) => res.data);
export const updateProduct = (id, payload) => api.patch('/products/' + id, payload).then((res) => res.data);