import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { format } from 'date-fns';
import { memo } from 'react';

export const SenderItem: React.FC<any> = memo(function SenderItem({ item }) {
  return (
    <HStack className="m-2 items-center justify-between" space="sm">
      <Text size="sm">{format(item.createdAt, 'yyyy-MM-dd HH:mm:ss')}</Text>
      <Card size="md" variant="elevated" className="flex-1 flex-grow rounded-md bg-primary-300 p-4">
        <Text>{item.content}</Text>
      </Card>
    </HStack>
  );
});
