import React from 'react';
import { View } from 'react-native';
import { ProfileAvatar } from './profile-avatar';
import { Heading } from './ui/heading';
import { HStack } from './ui/hstack';
import { Text } from './ui/text';

const MainHeader = () => {
  return (
    <HStack className="items-center justify-between ">
      <HStack>
        <Text size="sm">felix</Text>
        <Heading size="3xl">Blog</Heading>
      </HStack>
      <ProfileAvatar className="" />
    </HStack>
  );
};

export default MainHeader;
