import api from '../api/axios';

export const getWarehouses = () => api.get('/warehouses').then((res) => res.data);
export const createWarehouse = (payload) => api.post('/warehouses', payload).then((res) => res.data);
export const updateWarehouse = (id, payload) => api.patch('/warehouses/' + id, payload).then((res) => res.data);