import React from 'react';
import { Ellipsis, Share } from 'lucide-react-native';
import { Icon } from './ui/icon';
import { Menu, MenuItem, MenuItemLabel } from './ui/menu';
import { Pressable } from './ui/pressable';

const PostMenuPopover = ({ post, ...props }: any) => {
  const onShareItemPressed = () => {
    console.log('user');
  };

  const renderTrigger = (triggerProps: any) => {
    return (
      <Pressable {...triggerProps}>
        <Icon as={Ellipsis} />
      </Pressable>
    );
  };

  return (
    <Menu placement="bottom" disabledKeys={['Settings']} trigger={renderTrigger}>
      <MenuItem key="Share" textValue="Share" onPress={() => onShareItemPressed()}>
        <Icon as={Share} size="xs" className="mr-2" />
        <MenuItemLabel size="xs">分享</MenuItemLabel>
      </MenuItem>
    </Menu>
  );
};

export default PostMenuPopover;
