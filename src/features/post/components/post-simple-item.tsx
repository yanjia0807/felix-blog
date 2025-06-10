import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { useAuth } from '@/features/auth/components/auth-provider';
import useToast from '@/hooks/use-toast';
import { useRouter } from 'expo-router';
import React, { memo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated from 'react-native-reanimated';
import { useDeletePost } from '../api/use-delete-post';
import { useEditPostPublish } from '../api/use-edit-post-publish';
import { UserPostItem } from './user-post-item';

const PostSimpleItem: React.FC<any> = memo(function PostSimpleItem({
  item,
  index,
  userDocumentId,
  rowRefs,
  closeSwipeables,
}) {
  const { user: currentUser } = useAuth();
  const router = useRouter();

  const isMe = userDocumentId === currentUser?.documentId;
  const toast = useToast();

  const deleteMutation = useDeletePost();

  const editPublishMutation = useEditPostPublish();

  const onEdit = ({ item }: any) => {
    closeSwipeables();
    router.push(`/posts/edit/${item.documentId}`);
  };

  const onPublish = ({ item }: any) => {
    toast.confirm({
      description: `确定要发布吗？`,
      onConfirm: async () => {
        editPublishMutation.mutate(
          {
            documentId: item.documentId,
            isPublished: true,
          },
          {
            onSuccess: () => {
              toast.success({
                description: '发布成功',
              });
            },
            onError(error) {
              toast.error({ description: error.message });
            },
          },
        );
      },
    });
  };

  const onUnpublish = ({ item }: any) => {
    toast.confirm({
      description: `确定要取消发布吗？`,
      onConfirm: async () => {
        editPublishMutation.mutate(
          {
            documentId: item.documentId,
            isPublished: false,
          },
          {
            onSuccess: () => {
              toast.success({
                description: '取消发布成功',
              });
            },
            onError(error) {
              toast.error({ description: error.message });
            },
          },
        );
      },
    });
  };

  const onDeleteBtnPress = ({ item }: any) => {
    toast.confirm({
      description: `确认要删除吗？`,
      onConfirm: async () => {
        deleteMutation.mutate(
          {
            documentId: item.documentId,
          },
          {
            onSuccess: () => {
              toast.success({
                description: '删除成功',
              });
            },
            onError(error) {
              toast.error({ description: error.message });
            },
          },
        );
      },
    });
  };

  const onItemPress = ({ item }) => router.push(`/posts/${item.documentId}`);

  const renderRightAction = ({ item }: any) => {
    return (
      <Reanimated.View>
        <HStack className="h-full">
          {item.isPublished ? (
            <Button
              size="sm"
              className="h-full rounded-none"
              action="secondary"
              onPress={() => onUnpublish({ item })}>
              <ButtonText>取消发布</ButtonText>
            </Button>
          ) : (
            <Button
              size="sm"
              className="h-full rounded-none"
              action="secondary"
              onPress={() => onPublish({ item })}>
              <ButtonText>发布</ButtonText>
            </Button>
          )}
          <Button
            size="sm"
            className="h-full rounded-none"
            action="secondary"
            onPress={() => onEdit({ item })}>
            <ButtonText>编辑</ButtonText>
          </Button>
          <Button
            size="sm"
            className="h-full rounded-bl-none rounded-tl-none"
            action="negative"
            onPress={() => onDeleteBtnPress({ item })}>
            <ButtonText>删除</ButtonText>
          </Button>
        </HStack>
      </Reanimated.View>
    );
  };

  return (
    <View className={`${index === 0 ? 'mt-0' : 'mt-6'}`}>
      {isMe ? (
        <TouchableOpacity onPress={() => onItemPress({ item })}>
          <ReanimatedSwipeable
            renderRightActions={() => renderRightAction({ item })}
            ref={(ref) => {
              if (ref && !rowRefs.current.get(item.id)) {
                rowRefs.current.set(item.id, ref);
              }
            }}
            onSwipeableWillOpen={() => {
              [...rowRefs.current.entries()].forEach(([key, ref]) => {
                if (key !== item.id && ref) ref.close();
              });
            }}>
            <UserPostItem item={item} index={index} />
          </ReanimatedSwipeable>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => onItemPress({ item })}>
          <UserPostItem item={item} index={index} />
        </TouchableOpacity>
      )}
    </View>
  );
});

export default PostSimpleItem;
