import { createReport } from '@/api';
import { ReportSchema } from '@/app/reports/submit';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCreateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReportSchema) => createReport(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'list'] });
    },
    onError(error, variables, context) {
      console.error(error);
    },
  });
};
