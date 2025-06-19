import qs from 'qs';
import { apiClient } from '../utils/api-client';

export const createReport = async (formData) => {
  const query = qs.stringify({});
  const { legalDocumentId, ...rest } = formData;

  const data = {
    ...rest,
    legal: legalDocumentId,
  };

  const res = await apiClient.post(`/reports?${query}`, {
    data,
  });
  return res.data;
};
