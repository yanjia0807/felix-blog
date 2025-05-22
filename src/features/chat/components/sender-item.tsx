import { memo } from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';

export const SenderItem: React.FC<any> = memo(({ item }) => {
  return (
    <HStack className="items-center justify-between">
      <Text size="sm">{format(item.createdAt, 'yyyy-MM-dd HH:mm:ss')}</Text>
      <Card size="md" variant="elevated" className="m-3 w-2/3 rounded-md bg-primary-300 p-4">
        <Text>{item.content}</Text>
      </Card>
    </HStack>
  );
});
