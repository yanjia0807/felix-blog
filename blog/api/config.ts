import axios, { AxiosResponse } from 'axios';

export const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL;
const config = {
  baseURL: `${baseURL}/api`,
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json',
    'access-control-allow-origin': '*',
  },
};
const apiAxios = axios.create(config);

apiAxios.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error: Error) => {
    console.error('api failed', error);
    if (axios.isAxiosError(error)) {
      console.error('api failed', error.response?.data);
      throw error.response?.data.error;
    } else {
      throw error;
    }
  },
);

function setAuthHeader(accessToken: string | null) {
  apiAxios.interceptors.request.use(
    (config: any) => {
      if (accessToken) {
        config.headers.Authorization = 'Bearer ' + accessToken;
      } else {
        delete config.headers.Authorization;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );
}

export { apiAxios, setAuthHeader };
