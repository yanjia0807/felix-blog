import React from 'react';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Avatar, AvatarImage, AvatarFallbackText } from '@/components/ui/avatar';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { imageFormat } from '@/utils/file';

const ChatItem: React.FC<any> = ({ otherUser, item }) => {
  const router = useRouter();
  const onPress = () => router.push(`/chats/${item.documentId}`);

  return (
    <TouchableOpacity onPress={() => onPress()}>
      <HStack space="sm" className="w-full items-center rounded-lg py-2">
        <Avatar>
          {otherUser.avatar ? (
            <AvatarImage
              source={{
                uri: imageFormat(otherUser.avatar, 's', 't')?.fullUrl,
              }}
            />
          ) : (
            <AvatarFallbackText>{otherUser.username}</AvatarFallbackText>
          )}
        </Avatar>
        <Text size="md" bold={true}>
          {otherUser.username}
        </Text>
      </HStack>
    </TouchableOpacity>
  );
};

export default ChatItem;
