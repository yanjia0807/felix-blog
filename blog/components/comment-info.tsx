import { MessageSquare } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { HStack } from './ui/hstack';
import { Icon } from './ui/icon';
import { Text } from './ui/text';

const CommentInfo = ({ commentCount = 0, onCommentButtonPressed }: any) => {
  return (
    <TouchableOpacity onPress={() => onCommentButtonPressed()}>
      <HStack space="xs" className="items-center">
        <Icon as={MessageSquare} />
        <Text size="xs">{commentCount}</Text>
      </HStack>
    </TouchableOpacity>
  );
};

export default CommentInfo;
