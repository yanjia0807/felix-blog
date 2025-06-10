import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { imageFormat } from '@/utils/file';
import { useRouter } from 'expo-router';
import { ScanFace } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

export const UserNoticeAvatar = ({ user }: any) => {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={() => router.push(`/users/${user.documentId}`)}>
      <HStack className="flex-1 items-center overflow-hidden" space="sm">
        <Avatar size="md">
          {user.avatar ? (
            <AvatarImage
              source={{
                uri: imageFormat(user.avatar, 's', 't')?.fullUrl,
              }}
            />
          ) : (
            <AvatarFallbackText>{user.username}</AvatarFallbackText>
          )}
        </Avatar>
        <VStack className="justify-between" space="sm">
          <Text size="md" bold={true}>
            {user.username}
          </Text>
          <HStack className="items-center" space="xs">
            <Icon size="xs" as={ScanFace} />
            <Text size="xs">{user.gender === 'male' ? '男' : '女'}</Text>
          </HStack>
        </VStack>
      </HStack>
    </TouchableOpacity>
  );
};
