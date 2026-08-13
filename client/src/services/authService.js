import api from '../api/axios';

export const login = (email, password) =>
  api.post('/auth/login', { email, password }).then((res) => res.data);

export const register = (payload) =>
  api.post('/auth/register', payload).then((res) => res.data);