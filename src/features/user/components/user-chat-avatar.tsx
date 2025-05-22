import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { imageFormat } from '@/utils/file';

export const UserChatAvatar: React.FC<any> = ({ user }) => {
  return (
    <HStack className="items-center" space="sm">
      <Avatar size="md">
        {user?.avatar ? (
          <AvatarImage
            source={{
              uri: imageFormat(user.avatar, 's', 't')?.fullUrl,
            }}
          />
        ) : (
          <AvatarFallbackText>{user?.username}</AvatarFallbackText>
        )}
      </Avatar>
      <VStack>
        <Text size="sm" bold={true}>
          {user?.username}
        </Text>
        <Text size="xs" className="text-success-500">
          在线
        </Text>
      </VStack>
    </HStack>
  );
};
