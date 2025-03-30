import { useRouter } from 'expo-router';
import _ from 'lodash';
import { Calendar, MapPin, ScanFace } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { thumbnailSize } from '@/utils/file';
import { Avatar, AvatarFallbackText, AvatarGroup, AvatarImage } from './ui/avatar';
import { HStack } from './ui/hstack';
import { Icon } from './ui/icon';
import { Text } from './ui/text';
import { VStack } from './ui/vstack';

export const UserAvatar = ({ user }: any) => {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={() => router.push(`/users/${user.documentId}`)}>
      <HStack className="items-center" space="xs">
        <Avatar size="sm">
          {user.avatar ? (
            <AvatarImage
              source={{
                uri: thumbnailSize(user.avatar),
              }}
            />
          ) : (
            <AvatarFallbackText>{user.username}</AvatarFallbackText>
          )}
        </Avatar>
        <Text size="sm">{user.username}</Text>
      </HStack>
    </TouchableOpacity>
  );
};

export const UserLargeAvatar = ({ user }: any) => {
  return (
    <HStack className="items-center" space="md">
      <Avatar size="lg">
        {user.avatar ? (
          <AvatarImage
            source={{
              uri: thumbnailSize(user.avatar),
            }}
          />
        ) : (
          <AvatarFallbackText>{user.username}</AvatarFallbackText>
        )}
      </Avatar>
      <Text size="lg" bold={true}>
        {user.username}
      </Text>
    </HStack>
  );
};

export const UserAvatars = ({ users }: any) => {
  return (
    <AvatarGroup>
      {_.map(users, (user: any) => (
        <Avatar size="xs" key={user.documentId}>
          {user.avatar ? (
            <AvatarImage
              source={{
                uri: thumbnailSize(user.avatar),
              }}
            />
          ) : (
            <AvatarFallbackText>{user.username}</AvatarFallbackText>
          )}
        </Avatar>
      ))}
    </AvatarGroup>
  );
};

export const UserAvatarDetail = ({ user }: any) => {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={() => router.push(`/users/${user.documentId}`)}>
      <HStack className="flex-1 items-center overflow-hidden" space="sm">
        <Avatar size="md">
          <AvatarFallbackText>{user.username}</AvatarFallbackText>
          <AvatarImage
            source={{
              uri: thumbnailSize(user.avatar),
            }}
          />
        </Avatar>
        <VStack className="justify-between" space="sm">
          <HStack className="items-center" space="xs">
            <Text size="md" bold={true}>
              {user.username}
            </Text>
            <HStack className="items-center" space="xs">
              <Icon size="xs" as={ScanFace} />
              <Text size="xs">{user.gender === 'male' ? '男' : '女'}</Text>
            </HStack>
          </HStack>
          <HStack className="items-center" space="xs">
            <Icon size="xs" as={Calendar} />
            <Text size="xs">{user.birthday || '未设置'}</Text>
          </HStack>
          <HStack className="items-center" space="xs">
            <Icon size="xs" as={MapPin} />
            <Text size="xs" className="text-clip">
              {user.district
                ? `${user.district.provinceName}|${user.district.cityName}|${user.district.districtName}`
                : '未设置'}
            </Text>
          </HStack>
        </VStack>
      </HStack>
    </TouchableOpacity>
  );
};
