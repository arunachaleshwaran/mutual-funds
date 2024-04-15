import axios from 'axios';
import useAuthStore from './Store';
axios.interceptors.request.use(
  config => {
    config.headers.Authorization =
      useAuthStore.getState().authenticated;
    return config;
  },
  error => {
    console.log(error);
  }
);
