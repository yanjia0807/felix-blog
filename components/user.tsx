import { useRouter } from 'expo-router';
import { thumbnailSize } from '@/utils/file';
import { Avatar, AvatarFallbackText, AvatarImage } from './ui/avatar';
import { Button, ButtonText } from './ui/button';
import { VStack } from './ui/vstack';

export const AuthorInfo = ({ author }: any) => {
  const router = useRouter();
  const onPress = (documentId: string) => {
    router.push(`/users/${documentId}`);
  };

  return (
    <Button variant="link" onPress={() => onPress(author.documentId)}>
      <Avatar size="sm">
        <AvatarFallbackText>{author.username}</AvatarFallbackText>
        <AvatarImage
          source={{
            uri: thumbnailSize(author.avatar),
          }}
        />
      </Avatar>
      <VStack>
        <ButtonText size="sm">{author.username}</ButtonText>
      </VStack>
    </Button>
  );
};
