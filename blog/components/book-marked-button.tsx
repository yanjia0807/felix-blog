import { TouchableOpacity } from 'react-native';
import React from 'react';
import { Icon } from './ui/icon';
import { BookMarked } from 'lucide-react-native';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { useAuth } from './auth-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePostFavorited, UpdatePostFavoritedData } from '@/api';
import _ from 'lodash';
import colors from 'tailwindcss/colors';

const BookmarkedButtonStyles = tva({});

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

  const onFavoritedButtonPress = () => {
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
  };

  return (
    <TouchableOpacity
      className={BookmarkedButtonStyles({ className })}
      onPress={() => onFavoritedButtonPress()}>
      <Icon
        size="md"
        className="text-secondary-0"
        as={BookMarked}
        color={post.favoritedByMe ? colors.green[500] : colors.white}
      />
    </TouchableOpacity>
  );
};

export default BookMarkedButton;