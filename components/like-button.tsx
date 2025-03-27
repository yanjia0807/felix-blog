import React, { memo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import { Heart } from 'lucide-react-native';
import { twMerge } from 'tailwind-merge';
import { UpdatePostLikedData, updatePostLiked } from '@/api';
import { useAuth } from './auth-provider';
import { Button, ButtonIcon, ButtonText } from './ui/button';

export const LikeButton = memo(function LikeButton({ post, className }: any) {
  const { user } = useAuth();
  const userDocumentId = user?.documentId;
  const queryClient = useQueryClient();
  const likedByMe = user ? _.some(post.likedByUsers, { documentId: userDocumentId }) : false;

  const { mutate } = useMutation({
    mutationFn: ({ documentId, postData }: UpdatePostLikedData) => {
      return updatePostLiked({ documentId, postData });
    },
    async onSuccess(data: any) {
      await queryClient.invalidateQueries({
        queryKey: ['posts', 'detail', post.documentId],
        refetchType: 'all',
      });

      await queryClient.setQueriesData({ queryKey: ['posts', 'list'] }, (oldData: any) => ({
        ...oldData,
        pages: _.map(oldData.pages, (page: any) => ({
          ...page,
          data: _.map(page.data, (item: any) =>
            item.documentId === post.documentId
              ? {
                  ...item,
                  likedByUsers: data.likedByUsers,
                }
              : item,
          ),
        })),
      }));
    },
  });

  const onLikedButtonPress = () => {
    if (user) {
      const userDocumentIds = likedByMe
        ? _.map(
            _.filter(post.likedByUsers, (item: any) => item.documentId !== userDocumentId),
            'documentId',
          )
        : _.concat(_.map(post.likedByUsers, 'documentId'), userDocumentId);

      mutate({
        documentId: post.documentId,
        postData: {
          likedByUsers: userDocumentIds,
        },
      });
    }
  };

  return (
    <Button onPress={() => onLikedButtonPress()} variant="link">
      <ButtonIcon as={Heart} className={twMerge(likedByMe && 'text-red-500', className)} />
      <ButtonText size="xs">{post?.likedByUsers.length}</ButtonText>
    </Button>
  );
});
