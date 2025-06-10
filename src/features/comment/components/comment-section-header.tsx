import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/features/auth/components/auth-provider';
import useToast from '@/hooks/use-toast';
import { formatDistance } from '@/utils/date';
import { imageFormat } from '@/utils/file';
import _ from 'lodash';
import { Heart, HeartCrack } from 'lucide-react-native';
import React, { memo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useDeleteComment } from '../api/use-delete-comment';
import { useFetchRelatedComments } from '../api/use-fetch-related-comments';
import { useCommentActions, useIsCommentExpanded } from '../store';
import { CommentItem } from './comment-item';

export const CommentSectionHeader: React.FC<any> = memo(function CommentSectionHeader({
  index,
  item,
  inputRef,
}) {
  const postDocumentId = item.post.documentId;
  const commentDocumentId = item.documentId;

  const relatedCommentsQuery = useFetchRelatedComments({ postDocumentId, commentDocumentId });
  const isCommentExpanded = useIsCommentExpanded(commentDocumentId);
  const relatedComments = _.flatMap(relatedCommentsQuery.data?.pages, (page) => page.data);
  const deleteMutation = useDeleteComment();
  const { user } = useAuth();
  const toast = useToast();
  const { addExpandCommentDocumentId, setReplyComment } = useCommentActions();

  const onExpand = async (commentDocumentId: any) => addExpandCommentDocumentId(commentDocumentId);

  const onReply = () => {
    setReplyComment({
      documentId: commentDocumentId,
      topDocumentId: commentDocumentId,
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
        {item.relatedComments?.count > 0 && !isCommentExpanded && (
          <HStack>
            <Button
              size="sm"
              variant="link"
              action="secondary"
              onPress={() => onExpand(item.documentId)}>
              {relatedCommentsQuery.isLoading && <ButtonSpinner />}
              <ButtonText>展开回复</ButtonText>
            </Button>
          </HStack>
        )}
        {isCommentExpanded && (
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            {_.map(relatedComments, (item: any) => (
              <CommentItem key={item.documentId} item={item} inputRef={inputRef} />
            ))}
          </Animated.View>
        )}
      </VStack>
    </HStack>
  );
});
