import { useMutation, useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import { Ellipsis } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { updatePostFavorited, UpdatePostFavoritedData } from '@/api';
import { useAuth } from './auth-context';
import { Button, ButtonText } from './ui/button';
import { Divider } from './ui/divider';
import { Icon } from './ui/icon';
import { Popover, PopoverBackdrop, PopoverBody, PopoverContent } from './ui/popover';

const PostMenuPopover = ({ post, ...props }: any) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
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

  const onOpen = () => {
    setIsOpen(true);
  };

  const onClose = () => {
    setIsOpen(false);
  };

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

  const onShareButtonPressed = () => {
    console.log('user');
  };

  const renderTrigger = (triggerProps: any) => {
    return (
      <TouchableOpacity {...triggerProps}>
        <Icon as={Ellipsis} />
      </TouchableOpacity>
    );
  };

  return (
    <Popover isOpen={isOpen} onClose={onClose} onOpen={onOpen} {...props} trigger={renderTrigger}>
      <PopoverBackdrop />
      <PopoverContent className="w-24 px-2 py-1">
        <PopoverBody contentContainerClassName="items-center justify-center">
          <Button size="xs" variant="link" onPress={() => onFavoritedButtonPressed()}>
            <ButtonText>{post.favoritedByMe ? '已收藏' : '收藏'}</ButtonText>
          </Button>
          <Divider />
          <Button size="xs" variant="link" onPress={() => onShareButtonPressed()}>
            <ButtonText>分享</ButtonText>
          </Button>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default PostMenuPopover;
