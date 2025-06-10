import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { imageFormat } from '@/utils/file';
import { format } from 'date-fns';
import React, { memo } from 'react';
import { View } from 'react-native';

const ChatMessageItem: React.FC<any> = memo(function ChatMessageItem({ otherUser, item }) {
  return (
    <Card size="sm">
      <HStack space="sm" className="items-center rounded-lg">
        <Avatar size="md">
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
        <VStack space="xs" className="flex-1">
          <HStack className="items-center justify-between">
            <Text bold={true} size="sm">
              {otherUser.username}
            </Text>
            <Text size="xs">
              {item.lastMessage.createdAt &&
                format(item.lastMessage.createdAt, 'yyyy-MM-dd HH:mm:ss')}
            </Text>
          </HStack>
          <HStack className="items-center justify-between">
            <Text className="w-4/5" size="sm" numberOfLines={1} ellipsizeMode="tail">
              {item.lastMessage?.content}
            </Text>
            {item.chatStatuses[0]?.unreadCount > 0 && (
              <View className="h-4 w-4 items-center justify-center self-end rounded-full bg-success-600 p-[0.5]">
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  className="text-[8px] leading-none text-white">
                  {item.chatStatuses[0]?.unreadCount}
                </Text>
              </View>
            )}
          </HStack>
        </VStack>
      </HStack>
    </Card>
  );
});

export default ChatMessageItem;
