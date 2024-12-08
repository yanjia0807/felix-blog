import React from 'react';
import { View } from 'react-native';
import { ProfileAvatar } from './profile-avatar';
import { Heading } from './ui/heading';
import { HStack } from './ui/hstack';
import { Text } from './ui/text';

const MainHeader = () => {
  return (
    <HStack className="items-center justify-between">
      <HStack className="p-3">
        <Text size="sm" className="text-primary-400">
          felix
        </Text>
        <Text size="2xl" bold={true}>
          博客
        </Text>
      </HStack>
      <ProfileAvatar className="" />
    </HStack>
  );
};

export default MainHeader;
