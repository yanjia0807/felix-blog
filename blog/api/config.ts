import axios from 'axios';

export const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL;
const config = {
  baseURL: `${baseURL}/api`,
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json',
    'access-control-allow-origin': '*',
  },
};
const apiClient = axios.create(config);

apiClient.interceptors.request.use(
  (config) => {
    console.log(`[Request] ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      params: config.params,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error('[Request Error]', error);
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(
      `[Response] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`,
      {
        data: response.data,
        headers: response.headers,
      },
    );
    return response.data;
  },
  (error: Error) => {
    if (axios.isAxiosError(error)) {
      console.error(`[Response Error]`, error.response?.data);
      return Promise.reject(error.response?.data.error);
    } else {
      console.error('[Response Error]', error.message);
      return Promise.reject(error);
    }
  },
);

function setAuthHeader(accessToken: string | null) {
  apiClient.interceptors.request.use(
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

export { apiClient, setAuthHeader };
