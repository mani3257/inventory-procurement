import supplierApi from '../api/supplierAxios';
import api from '../api/axios';

export const supplierLogin = (loginEmail, password) =>
  supplierApi.post('/supplier-auth/login', { loginEmail, password }).then((res) => res.data);

export const supplierRegister = (payload) =>
  supplierApi.post('/supplier-auth/register', payload).then((res) => res.data);

export const getMySupplierProfile = () =>
  supplierApi.get('/supplier-auth/me').then((res) => res.data);

export const getMySupplierOrders = () =>
  supplierApi.get('/supplier-auth/my-orders').then((res) => res.data);

// Admin-only, uses the staff-auth api instance since it needs the admin's token
export const getPendingSuppliers = () =>
  api.get('/supplier-auth/pending').then((res) => res.data);

export const approveSupplier = (id) =>
  api.patch('/supplier-auth/' + id + '/approve').then((res) => res.data);