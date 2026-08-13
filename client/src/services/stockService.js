import api from '../api/axios';

export const transferStock = (payload) => api.post('/stock/transfer', payload).then((res) => res.data);
export const getStockLedger = (productId) => api.get('/stock/ledger/' + productId).then((res) => res.data);