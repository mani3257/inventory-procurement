import api from '../api/axios';

export const getUsers = () => api.get('/users').then((res) => res.data);
export const getMyProfile = () => api.get('/users/me').then((res) => res.data);
export const updateMyProfile = (payload) => api.patch('/users/me', payload).then((res) => res.data);