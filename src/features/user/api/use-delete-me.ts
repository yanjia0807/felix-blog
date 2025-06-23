import { deleteMe } from '@/api';
import { useLogout } from '@/features/auth/hooks/use-logout';
import { useMutation } from '@tanstack/react-query';

export const useDeleteMe = () => {
  const { logout } = useLogout();

  return useMutation({
    mutationFn: () => {
      return deleteMe();
    },
    onSuccess: (data: any) => {
      logout();
    },
    onError(error, variables, context) {
      console.error(error);
    },
  });
};
