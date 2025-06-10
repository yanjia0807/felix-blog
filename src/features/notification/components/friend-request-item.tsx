import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { UserNoticeAvatar } from '@/features/user/components/user-notice-avatar';
import { format } from 'date-fns';
import { memo } from 'react';
import { TouchableOpacity, View } from 'react-native';

export const FriendRequestItem = memo(function FriendRequestItem({
  item,
  onPress,
  onFrinedRequestAccept,
  onFrinedRequestReject,
}: any) {
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
            <UserNoticeAvatar user={item.data.friendRequest.sender} />
            <Text>
              {!item.feedback
                ? '申请添加你为好友'
                : item.feedback.state === 'accepted'
                  ? '已同意添加好友'
                  : '已拒绝添加好友'}
            </Text>
          </HStack>
          {!item.feedback && (
            <HStack className="item-center justify-end" space="sm">
              <Button
                variant="link"
                action="positive"
                size="sm"
                onPress={() => onFrinedRequestAccept({ item })}>
                <ButtonText>同意</ButtonText>
              </Button>
              <Button
                variant="link"
                action="negative"
                size="sm"
                onPress={() => onFrinedRequestReject({ item })}>
                <ButtonText>拒绝</ButtonText>
              </Button>
            </HStack>
          )}
        </VStack>
      </Card>
    </TouchableOpacity>
  );
});
