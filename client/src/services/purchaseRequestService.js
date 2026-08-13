import api from '../api/axios';

export const getPurchaseRequests = () => api.get('/purchase-requests').then((res) => res.data);
export const createPurchaseRequest = (payload) => api.post('/purchase-requests', payload).then((res) => res.data);
export const reviewPurchaseRequest = (id, decision) =>
  api.patch('/purchase-requests/' + id + '/review', { decision }).then((res) => res.data);