import React, { memo } from 'react';
import _ from 'lodash';
import { MapPin } from 'lucide-react-native';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { formatDistance } from '@/utils/date';

export const UserPostItem: React.FC<any> = memo(({ item, index }) => (
  <Card size="sm">
    <VStack space="lg">
      <VStack space="sm">
        <HStack className="items-center justify-between">
          <Heading numberOfLines={1} ellipsizeMode="tail" className="flex-1">
            {item.title}
          </Heading>
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
      </VStack>
      <Text numberOfLines={5}>{item.content}</Text>
    </VStack>
  </Card>
));
