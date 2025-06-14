import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { format } from 'date-fns';
import React, { memo } from 'react';
import { TouchableOpacity } from 'react-native';

export const SenderTextItem: React.FC<any> = memo(function SenderTextItem({ item }) {
  return (
    <TouchableOpacity>
      <HStack className="my-2 w-full items-center" space="xs">
        <Text size="xs" className="w-1/4">
          {format(item.createdAt, 'yyyy-MM-dd HH:mm:ss')}
        </Text>
        <Card size="md" variant="elevated" className="flex-1 rounded-lg bg-primary-300 p-4">
          <Text className="flex-wrap">{item.content}</Text>
        </Card>
      </HStack>
    </TouchableOpacity>
  );
});
