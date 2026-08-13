import api from '../api/axios';

export const getPurchaseOrders = () => api.get('/purchase-orders').then((res) => res.data);
export const createPurchaseOrder = (payload) => api.post('/purchase-orders', payload).then((res) => res.data);
export const receivePurchaseOrder = (id) =>
  api.patch('/purchase-orders/' + id + '/receive').then((res) => res.data);