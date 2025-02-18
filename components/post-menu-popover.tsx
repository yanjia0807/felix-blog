import { Ellipsis } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Button, ButtonText } from './ui/button';
import { Icon } from './ui/icon';
import { Popover, PopoverBackdrop, PopoverBody, PopoverContent } from './ui/popover';

const PostMenuPopover = ({ post, ...props }: any) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const onOpen = () => {
    setIsOpen(true);
  };

  const onClose = () => {
    setIsOpen(false);
  };

  const onShareButtonPressed = () => {
    console.log('user');
  };

  const renderTrigger = (triggerProps: any) => {
    return (
      <TouchableOpacity {...triggerProps}>
        <Icon as={Ellipsis} />
      </TouchableOpacity>
    );
  };

  return (
    <Popover isOpen={isOpen} onClose={onClose} onOpen={onOpen} {...props} trigger={renderTrigger}>
      <PopoverBackdrop />
      <PopoverContent className="w-24 px-2 py-1">
        <PopoverBody contentContainerClassName="items-center justify-center">
          <Button size="xs" variant="link" onPress={() => onShareButtonPressed()}>
            <ButtonText>分享</ButtonText>
          </Button>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default PostMenuPopover;
