import { Icon } from '@/components/ui/icon';
import { Menu, MenuItem, MenuItemLabel, MenuSeparator } from '@/components/ui/menu';
import { useAuth } from '@/features/auth/components/auth-provider';
import { useRouter } from 'expo-router';
import { Search, UserSearchIcon } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';

export const UserSearchMenu: React.FC<any> = () => {
  const router = useRouter();
  const { user } = useAuth();

  const renderTrigger = (triggerProps: any) => {
    return (
      <TouchableOpacity {...triggerProps}>
        <Icon as={UserSearchIcon} size="xl" className="text-secondary-900" />
      </TouchableOpacity>
    );
  };

  const onShowFollowings = () => {
    router.push({
      pathname: '/users/following-list',
      params: {
        userDocumentId: user.documentId,
        username: user.username,
      },
    });
  };

  const onShowFollowers = () => {
    router.push({
      pathname: '/users/follower-list',
      params: {
        userDocumentId: user.documentId,
        username: user.username,
      },
    });
  };

  const onShowFriends = () => {
    router.push({
      pathname: '/users/friend-list',
      params: {
        userDocumentId: user.documentId,
        username: user.username,
      },
    });
  };

  const onSearchUser = () => {
    router.push({
      pathname: '/users/search',
    });
  };

  return (
    <Menu placement="bottom" trigger={renderTrigger}>
      {user && (
        <>
          <MenuItem key="friends" textValue="好友" onPress={() => onShowFriends()}>
            <MenuItemLabel size="xs">好友</MenuItemLabel>
          </MenuItem>
          <MenuItem key="followings" textValue="编辑" onPress={() => onShowFollowings()}>
            <MenuItemLabel size="xs">关注</MenuItemLabel>
          </MenuItem>
          <MenuItem key="followers" textValue="删除" onPress={() => onShowFollowers()}>
            <MenuItemLabel size="xs">被关注</MenuItemLabel>
          </MenuItem>
          <MenuSeparator />
        </>
      )}
      <MenuItem key="search" textValue="删除" onPress={() => onSearchUser()}>
        <Icon as={Search} size="xs" className="mr-2" />
        <MenuItemLabel size="xs">查询用户</MenuItemLabel>
      </MenuItem>
    </Menu>
  );
};
