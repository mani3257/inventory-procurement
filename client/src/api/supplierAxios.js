import axios from 'axios';

const supplierApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});

supplierApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('supplierToken');
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

export default supplierApi;