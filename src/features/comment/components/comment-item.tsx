import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/features/auth/components/auth-provider';
import useToast from '@/hooks/use-toast';
import { formatDistance } from '@/utils/date';
import { imageFormat } from '@/utils/file';
import { Heart, HeartCrack } from 'lucide-react-native';
import React, { memo } from 'react';
import { TouchableOpacity } from 'react-native';
import { useDeleteComment } from '../api/use-delete-comment';
import { useCommentActions } from '../store';

export const CommentItem: React.FC<any> = memo(
  function CommentItem({ item, inputRef, openMenu }) {
    const postDocumentId = item.post?.documentId;
    const commentDocumentId = item.documentId;
    const { setSelectComment } = useCommentActions();

    const { user } = useAuth();
    const deleteMutation = useDeleteComment();
    const toast = useToast();
    const { setReplyComment } = useCommentActions();

    const onReply = () => {
      const replyComment = {
        documentId: commentDocumentId,
        topDocumentId: item.topComment.documentId,
        username: item.user.username,
      };
      setReplyComment(replyComment);

      setTimeout(() => inputRef.current?.focus(), 300);
    };

    const onDelete = () => {
      deleteMutation.mutate(
        {
          postDocumentId: postDocumentId,
          commentDocumentId: commentDocumentId,
        },
        {
          onSuccess(data, variables, context) {
            toast.success({ description: '评论已删除' });
          },
        },
      );
    };

    const onOpenCommentMenu = (item) => {
      if (user) {
        setSelectComment(item);
        openMenu();
      }
    };

    return (
      <VStack space="sm">
        <HStack space="sm" className="items-center">
          <Avatar size="xs">
            <AvatarFallbackText>{item.user.username}</AvatarFallbackText>
            <AvatarImage source={{ uri: imageFormat(item.user.avatar, 's', 't')?.fullUrl }} />
          </Avatar>
          <Text size="sm">{item.user.username}</Text>
          {item.reply && (
            <>
              <Text size="sm">→</Text>
              <Text size="sm">{item.reply.user.username}</Text>
            </>
          )}
        </HStack>
        <TouchableOpacity onPress={() => onOpenCommentMenu(item)}>
          <Text size="sm">{item.content}</Text>
          <HStack className="items-center justify-between" space="sm">
            <HStack className="items-center" space="sm">
              <Text size="xs">{formatDistance(item.createdAt)}</Text>
              {user && (
                <Button size="xs" variant="link" onPress={() => onReply()}>
                  <ButtonText>回复</ButtonText>
                </Button>
              )}

              {user && item.user.documentId === user.documentId && (
                <Button size="xs" variant="link" action="secondary" onPress={() => onDelete()}>
                  <ButtonText>删除</ButtonText>
                </Button>
              )}
            </HStack>
            <HStack className="flex-1 items-center justify-end" space="md">
              <TouchableOpacity>
                <HStack className="items-center" space="sm">
                  <Icon as={Heart} size="sm" />
                  <Text size="xs">{item.likes}</Text>
                </HStack>
              </TouchableOpacity>
              <TouchableOpacity>
                <HStack className="items-center" space="sm">
                  <Icon as={HeartCrack} size="sm" />
                  <Text size="xs">{item.unlikes}</Text>
                </HStack>
              </TouchableOpacity>
            </HStack>
          </HStack>
        </TouchableOpacity>
      </VStack>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.item.title === nextProps.item.title;
  },
);
