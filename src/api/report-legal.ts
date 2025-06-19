import qs from 'qs';
import { apiClient } from '../utils/api-client';

export const fetchReportLegals = async ({ pageParam }: any) => {
  const { pagination } = pageParam;
  const query = qs.stringify({
    sort: ['order:asc'],
    pagination,
  });
  const res = await apiClient.get(`/report-legals?${query}`);
  return res;
};

export const fetchReportLegal = async ({ documentId }: any) => {
  const query = qs.stringify({});
  const res = await apiClient.get(`/report-legals/${documentId}?${query}`);
  return res.data;
};
