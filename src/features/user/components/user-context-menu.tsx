import { Button } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Menu, MenuItem, MenuItemLabel } from '@/components/ui/menu';
import { useAuth } from '@/features/auth/components/auth-provider';
import useToast from '@/hooks/use-toast';
import { useRouter } from 'expo-router';
import _ from 'lodash';
import { Ellipsis, EyeClosed, MessageSquareWarning } from 'lucide-react-native';
import React from 'react';
import { useAddBlockUser } from '../api/user-add-block-user';
import { useRemoveBlockUser } from '../api/user-remove-block-user';

export const UserContextMenu: React.FC<any> = ({ documentId }) => {
  const router = useRouter();
  const toast = useToast();
  const { user: currentUser } = useAuth();

  const addBlockUser = useAddBlockUser();
  const removeBlockUser = useRemoveBlockUser();
  const isBlock = _.some(currentUser?.blockUsers, ['documentId', documentId]);

  const onBlock = () => {
    toast.confirm({
      title: '屏蔽用户',
      description: `屏蔽后将不在接收和显示该用户的数据，确认要屏蔽该用户吗？`,
      onConfirm: async () => {
        addBlockUser.mutate(
          { documentId },
          {
            onSuccess() {
              toast.success({
                description: '屏蔽成功',
              });
            },
            onError(error) {
              toast.error(error.message);
            },
          },
        );
      },
    });
  };

  const onRemoveBlock = () => {
    removeBlockUser.mutate(
      { documentId },
      {
        onSuccess() {
          toast.success({
            description: '取消成功',
          });
        },
        onError(error) {
          toast.error(error.message);
        },
      },
    );
  };

  const onReport = () => {
    router.push({
      pathname: '/reports',
      params: {
        contentRelation: 'user',
        contentDocumentId: documentId,
      },
    });
  };

  const renderTrigger = (triggerProps: any) => {
    return (
      <Button {...triggerProps} variant="link">
        <Icon as={Ellipsis} />
      </Button>
    );
  };

  return (
    <Menu placement="bottom" disabledKeys={['Settings']} trigger={renderTrigger}>
      {isBlock ? (
        <MenuItem key="Share" textValue="Share" onPress={() => onRemoveBlock()}>
          <HStack className="items-center" space="xs">
            <Icon as={EyeClosed} size="xs" />
            <MenuItemLabel size="xs">取消屏蔽</MenuItemLabel>
          </HStack>
        </MenuItem>
      ) : (
        <MenuItem key="Share" textValue="Share" onPress={() => onBlock()}>
          <HStack className="items-center" space="xs">
            <Icon as={EyeClosed} size="xs" />
            <MenuItemLabel size="xs">屏蔽用户</MenuItemLabel>
          </HStack>
        </MenuItem>
      )}

      <MenuItem key="Report" textValue="Report" onPress={() => onReport()}>
        <HStack className="items-center" space="xs">
          <Icon as={MessageSquareWarning} size="xs" />
          <MenuItemLabel size="xs">举报</MenuItemLabel>
        </HStack>
      </MenuItem>
    </Menu>
  );
};
function userToast() {
  throw new Error('Function not implemented.');
}
