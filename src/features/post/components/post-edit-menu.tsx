import { Icon } from '@/components/ui/icon';
import { Menu, MenuItem, MenuItemLabel, MenuSeparator } from '@/components/ui/menu';
import useToast from '@/hooks/use-toast';
import { useRouter } from 'expo-router';
import { Edit, Redo2, Trash, Undo2 } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useDeletePost } from '../api/use-delete-post';
import { useEditPostPublish } from '../api/use-edit-post-publish';

export const PostEditMenu: React.FC<any> = ({ isPublished, documentId }) => {
  const toast = useToast();
  const router = useRouter();

  const editPublishMutation = useEditPostPublish();

  const deleteMutation = useDeletePost();

  const onPublish = () => {
    toast.confirm({
      description: `确定要发布吗？`,
      onConfirm: async () => {
        editPublishMutation.mutate(
          {
            documentId,
            isPublished: true,
          },
          {
            onSuccess: (data, variables) => {
              setTimeout(
                () =>
                  toast.success({
                    description: '发布成功',
                  }),
                0,
              );
            },
            onError(error, variables, context) {
              toast.error({ description: error.message });
            },
          },
        );
      },
    });
  };

  const onUnpublish = () => {
    toast.confirm({
      description: `确定要取消发布吗？`,
      onConfirm: async () => {
        editPublishMutation.mutate(
          {
            documentId,
            isPublished: false,
          },
          {
            onSuccess: (data, variables) => {
              toast.success({
                description: '取消发布成功',
              });
            },
            onError(error, variables, context) {
              toast.error({ description: error.message });
            },
          },
        );
      },
    });
  };

  const onEdit = () => {
    router.push(`/posts/edit/${documentId}`);
  };

  const onDelete = () => {
    toast.confirm({
      description: `确认要删除吗？`,
      onConfirm: async () => {
        deleteMutation.mutate(
          {
            documentId,
          },
          {
            onSuccess: () => {
              toast.success({
                description: '删除成功',
              });
              router.back();
            },
            onError(error) {
              toast.error({ description: error.message });
            },
          },
        );
      },
    });
  };

  const renderTrigger = (triggerProps: any) => {
    return (
      <TouchableOpacity {...triggerProps}>
        <Icon as={Edit} />
      </TouchableOpacity>
    );
  };

  return (
    <Menu placement="bottom" trigger={renderTrigger}>
      {isPublished ? (
        <MenuItem key="Unpublish" textValue="取消发布" onPress={() => onUnpublish()}>
          <Icon as={Undo2} size="xs" className="mr-2" />
          <MenuItemLabel size="xs">取消发布</MenuItemLabel>
        </MenuItem>
      ) : (
        <>
          <MenuItem key="Unpublish" textValue="取消发布" onPress={() => onPublish()}>
            <Icon as={Redo2} size="xs" className="mr-2" />
            <MenuItemLabel size="xs">发布</MenuItemLabel>
          </MenuItem>
        </>
      )}
      <MenuSeparator />
      <MenuItem key="Edit" textValue="编辑" onPress={() => onEdit()}>
        <Icon as={Edit} size="xs" className="mr-2" />
        <MenuItemLabel size="xs">编辑</MenuItemLabel>
      </MenuItem>
      <MenuSeparator />
      <MenuItem key="Delete" textValue="删除" onPress={() => onDelete()}>
        <Icon as={Trash} size="xs" className="mr-2" />
        <MenuItemLabel size="xs">删除</MenuItemLabel>
      </MenuItem>
    </Menu>
  );
};
