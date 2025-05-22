import React from 'react';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { Avatar, AvatarFallbackText, AvatarImage, AvatarBadge } from '@/components/ui/avatar';
import { Button, ButtonIcon } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { imageFormat } from '@/utils/file';

export const OnlineUserHeader: React.FC<any> = () => {
  const router = useRouter();
  const onPress = () => router.push('/users/list');

  return (
    <VStack className="items-center justify-center" space="xs">
      <Button
        onPress={onPress}
        variant="outline"
        action="secondary"
        className="mr-2 h-[42] w-[42] rounded-full">
        <ButtonIcon as={Plus} />
      </Button>
    </VStack>
  );
};

export const OnlineUserItem: React.FC<any> = ({ item }) => {
  const router = useRouter();
  const onPress = () => router.push(`/users/${item.documentId}`);

  return (
    <TouchableOpacity onPress={() => onPress()} className="mx-2">
      <VStack className="items-center" space="xs">
        <Avatar key={item.id} size="md">
          <AvatarFallbackText>{item.username}</AvatarFallbackText>
          <AvatarImage
            source={{
              uri: imageFormat(item.avatar, 's', 't')?.fullUrl,
            }}
          />
          <AvatarBadge />
        </Avatar>
        <Text size="xs">{item.username}</Text>
      </VStack>
    </TouchableOpacity>
  );
};
