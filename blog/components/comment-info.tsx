import { MessageCircle } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useAuth } from './auth-context';
import { HStack } from './ui/hstack';
import { Icon } from './ui/icon';
import { Text } from './ui/text';

const CommentInfo = ({ post, onCommentButtonPressed }: any) => {
  const { user } = useAuth();

  return (
    <TouchableOpacity onPress={() => onCommentButtonPressed()}>
      <HStack space="xs" className="items-center">
        <Icon as={MessageCircle} />
        <Text size="xs">23</Text>
      </HStack>
    </TouchableOpacity>
  );
};

export default CommentInfo;
