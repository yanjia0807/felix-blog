import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { formatDistance } from '@/utils/date';
import { MapPin } from 'lucide-react-native';
import React, { memo } from 'react';

export const UserPostItem: React.FC<any> = memo(function UserPostItem({ item, index }) {
  return (
    <Card size="sm">
      <VStack space="md">
        <HStack className="items-center justify-between">
          <Text size="lg" numberOfLines={1} ellipsizeMode="tail" className="flex-1 font-bold">
            {item.title}
          </Text>
        </HStack>
        <HStack className="items-center justify-between">
          <Text size="xs" className="items-center">
            {formatDistance(item.createdAt)}
          </Text>
          <HStack space="xs" className="w-1/2 items-center justify-end">
            {item.poi?.address && (
              <>
                <Icon as={MapPin} size="xs" />
                <Text size="xs" numberOfLines={1}>
                  {item.poi.address}
                </Text>
              </>
            )}
          </HStack>
        </HStack>
        <Text numberOfLines={5}>{item.content}</Text>
      </VStack>
    </Card>
  );
});
