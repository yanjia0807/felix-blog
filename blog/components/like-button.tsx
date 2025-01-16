import { useMutation, useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import { Heart } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { twMerge } from 'tailwind-merge';
import { UpdatePostLikedData, updatePostLiked } from '@/api';
import { useAuth } from './auth-context';
import { usePostFilterDrawerContext } from './post-filter';
import { HStack } from './ui/hstack';
import { Icon } from './ui/icon';
import { Text } from './ui/text';

export const LikeButton = ({ post, className }: any) => {
  const { user } = useAuth();
  const userDocumentId = user?.documentId;
  const queryClient = useQueryClient();
  const { filters } = usePostFilterDrawerContext();
  const likedByMe = user ? _.some(post.likedByUsers, { documentId: userDocumentId }) : false;

  const { mutate } = useMutation({
    mutationFn: ({ documentId, postData }: UpdatePostLikedData) => {
      return updatePostLiked({ documentId, postData });
    },
    async onSuccess(data: any, variables, context) {
      await queryClient.invalidateQueries({
        queryKey: ['posts', post.documentId, { userDocumentId }],
      });

      await queryClient.setQueryData(
        ['posts', 'list', { userDocumentId, filters }],
        (oldData: any) => {
          return {
            pages: _.map(oldData.pages, (page: any) => ({
              meta: page.meta,
              data: _.map(page.data, (item: any) =>
                item.documentId === post.documentId
                  ? {
                      ...item,
                      likedByUsers: data.likedByUsers,
                    }
                  : {
                      ...item,
                    },
              ),
            })),
            pageParams: oldData.pageParams,
          };
        },
      );
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
    <TouchableOpacity onPress={() => onLikedButtonPress()}>
      <HStack space="xs" className="items-center">
        <Icon as={Heart} className={twMerge(likedByMe && 'text-red-400', className)} />
        <Text size="xs">{post?.likedByUsers.length}</Text>
      </HStack>
    </TouchableOpacity>
  );
};
