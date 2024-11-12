import { TouchableOpacity } from 'react-native';
import React from 'react';
import { HStack } from './ui/hstack';
import { Icon } from './ui/icon';
import { Text } from './ui/text';
import { MessageCircle } from 'lucide-react-native';

const CommentInfo = () => {
  return (
    <TouchableOpacity>
      <HStack space="xs" className="items-center">
        <Icon as={MessageCircle} />
        <Text size="xs">23</Text>
      </HStack>
    </TouchableOpacity>
  );
};

export default CommentInfo;
