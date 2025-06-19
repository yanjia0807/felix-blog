import { fetchReportLegal } from '@/api';
import { useQuery } from '@tanstack/react-query';

export const useReportLegal = ({ documentId }) => {
  return useQuery({
    queryKey: ['reportLegals', 'detail', { documentId }],
    queryFn: () => fetchReportLegal({ documentId }),
  });
};
