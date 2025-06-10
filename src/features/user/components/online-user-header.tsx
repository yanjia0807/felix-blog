import { Button, ButtonIcon } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import React, { memo } from 'react';

export const OnlineUserHeader: React.FC<any> = memo(function OnlineUserHeader() {
  const router = useRouter();
  const onPress = () => router.push('/users/list');

  return (
    <VStack className="items-center justify-center" space="xs">
      <Button
        onPress={onPress}
        variant="outline"
        action="secondary"
        className="mr-2 h-[30] w-[30] rounded-full p-0">
        <ButtonIcon as={Plus} />
      </Button>
    </VStack>
  );
});
