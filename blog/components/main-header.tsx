import { useRouter } from 'expo-router';
import { MessageSquareText } from 'lucide-react-native';
import React from 'react';
import { Pressable, TouchableOpacity } from 'react-native';
import { twMerge } from 'tailwind-merge';
import { apiServerURL } from '@/api';
import { useAuth } from './auth-context';
import { Badge, BadgeText } from './ui/badge';
import { Box } from './ui/box';
import { Button, ButtonIcon } from './ui/button';
import { HStack } from './ui/hstack';
import { Icon } from './ui/icon';
import { Image } from './ui/image';
import { VStack } from './ui/vstack';

const MainHeader = ({ className }: any) => {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <HStack className={twMerge('items-center justify-between', className)}>
      <HStack className="p-3">
        <Image alt="logo" source={require('/assets/images/icon.png')} size="xs" />
      </HStack>
      {/* {user ? (
        <TouchableOpacity
          className="m-3"
          onPress={() => {
            router.navigate('/message');
          }}>
          <Badge
            className="absolute right-[-3] top-[-3] z-10 h-6 w-6 rounded-full bg-red-600"
            variant="solid">
            <BadgeText className="text-white">2</BadgeText>
          </Badge>
          <Icon as={MessageSquareText} size={28 as any} className="text-typography-900" />
        </TouchableOpacity>
      ) : (
        <></>
      )} */}
    </HStack>
  );
};

export default MainHeader;
