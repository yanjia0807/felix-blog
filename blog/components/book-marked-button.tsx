import { useMutation, useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import { BookMarked } from 'lucide-react-native';
import React from 'react';
import { twMerge } from 'tailwind-merge';
import { updatePostFavorited, UpdatePostFavoritedData } from '@/api';
import { useAuth } from './auth-context';
import { Icon } from './ui/icon';
import { Pressable } from './ui/pressable';

const BookMarkedButton = ({ className, post, ...props }: any) => {
  const { user } = useAuth();

  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: ({ documentId, postData }: UpdatePostFavoritedData) => {
      return updatePostFavorited({ documentId, postData });
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
            newPost.favoritedByMe = !newPost.favoritedByMe;
          }
          return newData;
        });
      }

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

  const onFavoritedButtonPressed = () => {
    if (user) {
      const userDocumentIds = post.favoritedByMe
        ? _.map(
            _.filter(post.favoritedByUsers, (item: any) => item.documentId !== user.documentId),
            'documentId',
          )
        : _.concat(_.map(post.favoritedByUsers, 'documentId'), user.documentId);

      mutate({
        documentId: post.documentId,
        postData: {
          favoritedByUsers: userDocumentIds,
        },
      });
    }
  };

  return (
    <Pressable
      className={twMerge(className, post?.favoritedByMe && 'bg-tertiary-200')}
      onPress={() => onFavoritedButtonPressed()}>
      <Icon size="md" as={BookMarked} />
    </Pressable>
  );
};

export default BookMarkedButton;
