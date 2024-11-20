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
import { UpdatePostLikeData, updatePostLike } from '@/api';

const LikesInfo = ({ post }: any) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: ({ documentId, postData }: UpdatePostLikeData) => {
      return updatePostLike({ documentId, postData });
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      const prevData: any = queryClient.getQueryData(['posts']);
      queryClient.setQueryData(['posts'], (oldData: any) => {
        if (oldData) {
          const newData = _.cloneDeep(oldData);
          const newPosts = _.flatten(_.map(newData.pages, 'data'));
          const newPost = _.find(newPosts, { documentId: post.documentId });
          if (newPost) {
            newPost.likedByMe = !newPost.likedByMe;
            newPost.likedByUsers = newPost.likedByUsers.filter(
              (userItem: any) => userItem.documentId !== user.documentId,
            );
          }
          return newData;
        }

        return oldData;
      });
      return { prevData };
    },
    onSettled: (data, error, variables, context) => {
      if (error) {
        queryClient.setQueryData(['posts'], context?.prevData);
      }
      queryClient.invalidateQueries({ queryKey: ['posts'], exact: true });
      queryClient.invalidateQueries({ queryKey: ['posts', post.documentId] });
    },
  });

  const toggleLike = () => {
    let likedByUserIds = post.likedByMe
      ? _.map(
          _.filter(post.likedByUsers, (item: any) => item.documentId !== user.documentId),
          'documentId',
        )
      : _.concat(_.map(post.likedByUsers, 'documentId'), user.documentId);

    mutate({
      documentId: post.documentId,
      postData: {
        likedByUsers: likedByUserIds,
      },
    });
  };

  return (
    <TouchableOpacity onPress={() => toggleLike()}>
      <HStack space="xs" className="items-center">
        <Icon as={Heart} color={post?.likedByMe ? colors.red[500] : colors.gray[500]} />
        <Text size="xs">{post?.likedByUsers.length}</Text>
      </HStack>
    </TouchableOpacity>
  );
};

export default LikesInfo;
