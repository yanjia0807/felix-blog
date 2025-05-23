import { memo } from 'react';
import { Heart, HeartCrack } from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/features/auth/components/auth-provider';
import useToast from '@/hooks/use-toast';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { formatDistance } from '@/utils/date';
import { imageFormat } from '@/utils/file';
import { useDeleteComment, useFetchRelatedComments } from '../api';
import { expandComment, replyComment, selectIsCommentExpanded } from '../store';

export const CommentSectionHeader: React.FC<any> = memo(
  ({ index, item, inputRef }) => {
    const postDocumentId = item.post.documentId;
    const commentDocumentId = item.documentId;
    const deleteMutation = useDeleteComment({ postDocumentId });

    const { user } = useAuth();
    const dispatch = useAppDispatch();
    const toast = useToast();

    const isExpanded = useAppSelector((state) =>
      selectIsCommentExpanded(state, { postDocumentId, commentDocumentId }),
    );

    useFetchRelatedComments({
      postDocumentId,
      commentDocumentId,
      enabled: item.relatedComments.count > 0,
    });

    const onExpand = async (commentDocumentId: any) => {
      dispatch(expandComment({ postDocumentId, commentDocumentId }));
    };

    const onReply = () => {
      dispatch(
        replyComment({
          documentId: commentDocumentId,
          topDocumentId: commentDocumentId,
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
          onSuccess() {
            toast.success({ description: '评论已删除' });
          },
        },
      );
    };

    return (
      <HStack className={`my-2 ${index === 0 ? 'mt-0' : ''}`}>
        <View className="w-12">
          <Avatar size="sm">
            <AvatarFallbackText>{item.user.username}</AvatarFallbackText>
            <AvatarImage
              source={{
                uri: imageFormat(item.user.avatar, 's', 't')?.fullUrl,
              }}
            />
          </Avatar>
        </View>
        <VStack className="flex-1" space="xs">
          <Text size="sm">{item.user.username}</Text>
          <Text size="md">{item.content}</Text>
          <HStack className="items-center justify-between">
            <HStack className="items-center" space="md">
              <Text size="sm">{formatDistance(item.createdAt)}</Text>
              {user && (
                <Button size="sm" variant="link" onPress={() => onReply()}>
                  <ButtonText>回复</ButtonText>
                </Button>
              )}

              {user && item.user.documentId === user.documentId && (
                <Button size="sm" action="secondary" variant="link" onPress={() => onDelete()}>
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
          {item.relatedComments?.count > 0 && !isExpanded && (
            <HStack>
              <Button
                size="sm"
                variant="link"
                action="secondary"
                onPress={() => onExpand(item.documentId)}>
                <ButtonText>展开回复</ButtonText>
              </Button>
            </HStack>
          )}
        </VStack>
      </HStack>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.item.title === nextProps.item.title,
      prevProps.item.relatedComments.count === nextProps.item.relatedComments.count
    );
  },
);
