import axios from 'axios';
import { useAuthStore } from '../Store';
axios.interceptors.request.use(
  config => {
    config.headers.authorization =
      useAuthStore.getState().authenticated;
    return config;
  },
  error => {
    console.log(error);
  }
);
