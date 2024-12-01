import axios from 'axios';

const amapUrl = process.env.EXPO_PUBLIC_AMAP_WEB_API_URL;
const amapKey = process.env.EXPO_PUBLIC_AMAP_WEB_API_KEY;

const config = {
  baseURL: amapUrl,
  headers: {
    'Content-Type': 'application/json',
    'access-control-allow-origin': '*',
  },
};

export const amapClient = axios.create(config);

amapClient.interceptors.request.use(
  (config) => {
    config.params = config.params || {};
    config.params.key = amapKey;

    console.log(`[amap request] ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      params: config.params,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error('[amap request error]', error);
    return Promise.reject(error);
  },
);

amapClient.interceptors.response.use(
  (response) => {
    console.log(
      `[amap response] ${response.config.method?.toUpperCase()} ${response.config.url} - status: ${response.status}`,
      {
        data: response.data,
        headers: response.headers,
      },
    );
    return response.data;
  },
  (error: Error) => {
    if (axios.isAxiosError(error)) {
      console.error(`[amap axios error]`, error.response?.data.error || error);
      return Promise.reject(error.response?.data.error || error);
    } else {
      console.error('[amap error]', error.message);
      return Promise.reject(error);
    }
  },
);
