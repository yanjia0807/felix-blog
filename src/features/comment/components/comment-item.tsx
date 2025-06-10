import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/features/auth/components/auth-provider';
import useToast from '@/hooks/use-toast';
import { imageFormat } from '@/utils/file';
import { format } from 'date-fns';
import { Heart, HeartCrack } from 'lucide-react-native';
import React, { memo } from 'react';
import { TouchableOpacity } from 'react-native';
import { useDeleteComment } from '../api/use-delete-comment';
import { useCommentActions } from '../store';

export const CommentItem: React.FC<any> = memo(
  function CommentItem({ item, inputRef }) {
    const postDocumentId = item.post?.documentId;
    const commentDocumentId = item.documentId;

    const { user } = useAuth();
    const deleteMutation = useDeleteComment();
    const toast = useToast();
    const { setReplyComment } = useCommentActions();

    const onReply = () => {
      setReplyComment({
        documentId: commentDocumentId,
        topDocumentId: item.topComment.documentId,
        username: item.user.username,
      });

      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
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

    return (
      <HStack className={`my-2 items-start`}>
        <HStack space="sm">
          <Avatar size="xs">
            <AvatarFallbackText>{item.user.username}</AvatarFallbackText>
            <AvatarImage source={{ uri: imageFormat(item.user.avatar, 's', 't')?.fullUrl }} />
          </Avatar>
          <VStack className="flex-1">
            <HStack className="items-center" space="sm">
              <Text size="sm">{item.user.username}</Text>
              {item.reply && (
                <>
                  <Text>→</Text>
                  <Text size="sm">{item.reply.user.username}</Text>
                </>
              )}
            </HStack>
            <Text size="md">{item.content}</Text>
            <HStack className="items-center justify-between">
              <HStack className="items-center" space="md">
                <Text size="sm">{format(item.createdAt, 'yyyy-MM-dd HH:mm:ss')}</Text>
                {user && (
                  <Button size="sm" variant="link" onPress={() => onReply()}>
                    <ButtonText>回复</ButtonText>
                  </Button>
                )}

                {user && item.user.documentId === user.documentId && (
                  <Button size="sm" variant="link" action="secondary" onPress={() => onDelete()}>
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
          </VStack>
        </HStack>
      </HStack>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.item.title === nextProps.item.title;
  },
);
