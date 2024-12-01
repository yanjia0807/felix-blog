import { router } from 'expo-router';
import { Calendar, EditIcon, MapPin, MessageCircle, ScanFace } from 'lucide-react-native';
import React from 'react';
import { apiServerURL } from '@/api';
import { useAuth } from './auth-context';
import { Avatar, AvatarImage } from './ui/avatar';
import { Box } from './ui/box';
import { Button, ButtonIcon, ButtonText } from './ui/button';
import { HStack } from './ui/hstack';
import { Icon } from './ui/icon';
import { Text } from './ui/text';
import { VStack } from './ui/vstack';

const UserInfoHeader = () => {
  const { user } = useAuth();
  return (
    <Box>
      <HStack className="items-center justify-between">
        <Avatar size="lg">
          <AvatarImage
            source={{
              uri: `${apiServerURL}/${user.profile?.avatar?.formats.thumbnail.url}`,
            }}
          />
        </Avatar>
        <HStack className="items-center" space="lg">
          <Button size="sm" className="rounded-full p-2.5" variant="outline">
            <ButtonIcon as={MessageCircle} />
          </Button>
          <Button
            size="sm"
            className="rounded-3xl px-6"
            onPress={() => {
              router.push('/profile-edit');
            }}>
            <ButtonText>编辑</ButtonText>
            <ButtonIcon as={EditIcon} />
          </Button>
        </HStack>
      </HStack>
      <VStack space="md">
        <Text size="3xl" bold={true}>
          {user.username}
        </Text>
        <HStack space="md" className="items-center">
          <HStack className="items-center" space="xs">
            <Icon size="xs" as={Calendar} />
            <Text size="xs">{user.profile.birthday}</Text>
          </HStack>
          <HStack className="items-center" space="xs">
            <Icon size="xs" as={ScanFace} />
            <Text size="xs">{user.profile.gender === 'male' ? '男' : '女'}</Text>
          </HStack>
          <HStack className="items-center" space="xs">
            <Icon size="xs" as={MapPin} />
            <Text size="xs">重庆｜南岸区</Text>
          </HStack>
        </HStack>
      </VStack>
    </Box>
  );
};

export default UserInfoHeader;
