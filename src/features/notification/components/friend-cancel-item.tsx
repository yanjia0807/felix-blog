import { memo } from 'react';
import { format } from 'date-fns';
import { TouchableOpacity, View } from 'react-native';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { UserNoticeAvatar } from '@/features/user/components/user-notice-avatar';

export const FriendCancelItem = memo(({ item, onPress }: any) => {
  return (
    <TouchableOpacity onPress={() => onPress()}>
      <Card variant="ghost" size="sm">
        <VStack space="md">
          <HStack className="items-center justify-between">
            <Text size="sm">{format(item.createdAt, 'yyyy-MM-dd HH:mm:ss')}</Text>
            {item.state === 'unread' ? (
              <View className="h-3 w-3 rounded-full bg-success-400" />
            ) : (
              <View />
            )}
          </HStack>
          <HStack className="items-center justify-between">
            <UserNoticeAvatar user={item.data.user} />
            <Text>删除了好友</Text>
          </HStack>
        </VStack>
      </Card>
    </TouchableOpacity>
  );
});
