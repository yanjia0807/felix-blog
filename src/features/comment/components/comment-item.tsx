import { memo, useEffect } from 'react';
import { format } from 'date-fns';
import { Heart, HeartCrack } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { useAuth } from '@/components/auth-provider';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import useToast from '@/hooks/use-custom-toast';
import { useAppDispatch } from '@/store/hook';
import { imageFormat } from '@/utils/file';
import { useDeleteComment } from '../api';
import { replyComment } from '../store';

export const CommentItem: React.FC<any> = memo(
  ({ item, inputRef }) => {
    useEffect(() => console.log('@render CommentItem'));

    const postDocumentId = item.post?.documentId;
    const commentDocumentId = item.documentId;

    const { user } = useAuth();
    const dispatch = useAppDispatch();
    const deleteMutation = useDeleteComment({ postDocumentId });
    const toast = useToast();

    const onReply = () => {
      dispatch(
        replyComment({
          documentId: commentDocumentId,
          topDocumentId: item.topComment.documentId,
          username: item.user.username,
        }),
      );
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    };

    const onDelete = () => {
      deleteMutation.mutate(
        {
          documentId: commentDocumentId,
        },
        {
          onSuccess(data, variables, context) {
            toast.success({ description: '评论已删除' });
          },
        },
      );
    };

    return (
      <HStack className={`my-2 items-start pl-12`}>
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
