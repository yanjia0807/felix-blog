import React from 'react';
import { Ellipsis, Share } from 'lucide-react-native';
import { Button } from './ui/button';
import { Icon } from './ui/icon';
import { Menu, MenuItem, MenuItemLabel } from './ui/menu';

const PostItemMenu = ({ post, ...props }: any) => {
  const onShareItemPressed = () => {
    console.log('user');
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
      <MenuItem key="Share" textValue="Share" onPress={() => onShareItemPressed()}>
        <Icon as={Share} size="xs" className="mr-2" />
        <MenuItemLabel size="xs">分享</MenuItemLabel>
      </MenuItem>
    </Menu>
  );
};

export default PostItemMenu;
