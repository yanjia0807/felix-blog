import { apiAxios } from './config';
import qs from 'qs';
import { useMutation, useQuery } from '@tanstack/react-query';

interface LikeData {}

export const createLike = async (likeData: LikeData) => {
  console.log('createLike', likeData);
  const res = await apiAxios.post(`/likes`, {
    data: likeData,
  });
  return res.data;
};

export const deleteLike = async (likeId: string) => {
  console.log('deleteLike', likeId);
  const res = await apiAxios.delete(`/likes/${likeId}`);
  return res.data;
};

export const useCreateLike = () => {
  return useMutation({
    mutationFn: (postData: LikeData) => {
      return createLike(postData);
    },
  });
};

export const useDeleteLike = () => {
  return useMutation({
    mutationFn: (likeId: string) => {
      return deleteLike(likeId);
    },
  });
};
