import api from '../api/axios';

export const getSuppliers = () => api.get('/suppliers').then((res) => res.data);
export const createSupplier = (payload) => api.post('/suppliers', payload).then((res) => res.data);
export const updateSupplier = (id, payload) => api.patch('/suppliers/' + id, payload).then((res) => res.data);