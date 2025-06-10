import { updatePostLiked } from '@/api';
import { Button, ButtonGroup, ButtonIcon, ButtonText } from '@/components/ui/button';
import { useAuth } from '@/features/auth/components/auth-provider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import { Heart } from 'lucide-react-native';
import React, { memo } from 'react';
import { twMerge } from 'tailwind-merge';

export const LikeButton = memo(function LikeButton({ post, className, size = 'sm' }: any) {
  const { user } = useAuth();
  const userDocumentId = user?.documentId;
  const queryClient = useQueryClient();
  const likedByMe = user ? _.some(post.likedByUsers, { documentId: userDocumentId }) : false;

  const { mutate } = useMutation({
    mutationFn: ({ documentId, postData }: any) => {
      return updatePostLiked({ documentId, postData });
    },
    async onSuccess(data: any) {
      await queryClient.invalidateQueries({
        queryKey: ['posts', 'detail', { documentId: post.documentId }],
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
      <ButtonGroup className="flex-row items-center" space={size}>
        <ButtonIcon
          as={Heart}
          size={size}
          className={twMerge(likedByMe && 'text-red-500', className)}
        />
        <ButtonText size={size}>{post?.likedByUsers.length}</ButtonText>
      </ButtonGroup>
    </Button>
  );
});
