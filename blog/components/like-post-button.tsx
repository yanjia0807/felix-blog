import _ from 'lodash';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { HStack } from './ui/hstack';
import colors from 'tailwindcss/colors';
import { Icon } from './ui/icon';
import { Text } from './ui/text';
import { Heart } from 'lucide-react-native';
import { useAuth } from './auth-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdatePostLikedData, updatePostLiked } from '@/api';

const LikePostButton = ({ post }: any) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: ({ documentId, postData }: UpdatePostLikedData) => {
      return updatePostLiked({ documentId, postData });
    },

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      const prevData: any = queryClient.getQueryData(['posts']);
      if (prevData) {
        queryClient.setQueryData(['posts'], (oldData: any) => {
          const newData = _.cloneDeep(oldData);
          const newPost = _.find(_.flatten(_.map(newData.pages, 'data')), {
            documentId: post.documentId,
          });
          if (newPost) {
            newPost.likedByMe = !newPost.likedByMe;
            newPost.likedByUsers = newPost.likedByMe
              ? _.concat(_.map(post.likedByUsers, 'documentId'), user.documentId)
              : _.filter(
                  newPost.likedByUsers,
                  (userItem: any) => userItem.documentId !== user.documentId,
                );
            return newData;
          }
        });
        return { prevData };
      }
    },

    onSettled: (data, error, variables, context) => {
      if (error) {
        queryClient.setQueryData(['posts'], context?.prevData);
      }
      queryClient.invalidateQueries({ queryKey: ['posts'], exact: true });
      queryClient.invalidateQueries({ queryKey: ['posts', post.documentId] });
    },
  });

  const onLikedButtonPress = () => {
    const userDocumentIds = post.likedByMe
      ? _.map(
          _.filter(post.likedByUsers, (item: any) => item.documentId !== user.documentId),
          'documentId',
        )
      : _.concat(_.map(post.likedByUsers, 'documentId'), user.documentId);

    mutate({
      documentId: post.documentId,
      postData: {
        likedByUsers: userDocumentIds,
      },
    });
  };

  return (
    <TouchableOpacity onPress={() => onLikedButtonPress()}>
      <HStack space="xs" className="items-center">
        <Icon as={Heart} color={post?.likedByMe ? colors.red[500] : colors.gray[500]} />
        <Text size="xs">{post?.likedByUsers.length}</Text>
      </HStack>
    </TouchableOpacity>
  );
};

export default LikePostButton;