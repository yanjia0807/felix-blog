import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { imageFormat } from '@/utils/file';
import { format } from 'date-fns';
import { memo } from 'react';

export const ReceiverItem: React.FC<any> = memo(function ReceiverItem({ item, otherUser }) {
  return (
    <HStack>
      <Avatar size="xs">
        <AvatarFallbackText>{otherUser.username}</AvatarFallbackText>
        <AvatarImage
          source={{
            uri: imageFormat(otherUser.avatar, 's', 't')?.fullUrl,
          }}
        />
      </Avatar>
      <HStack className="flex-1 items-center justify-between">
        <Card size="md" variant="elevated" className="m-2 w-2/3 rounded-md bg-primary-200 p-4">
          <Text>{item.content}</Text>
        </Card>
        <Text size="sm" className="flex-1">
          {format(item.createdAt, 'yyyy-MM-dd HH:mm:ss')}
        </Text>
      </HStack>
    </HStack>
  );
});
