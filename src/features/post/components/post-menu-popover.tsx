import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Menu, MenuItem, MenuItemLabel } from '@/components/ui/menu';
import { Ellipsis, Share } from 'lucide-react-native';
import React from 'react';

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
