import { Stack } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native';
import { VStack } from '@/components/ui/vstack';

const FriendScreen = () => {
  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{
          headerShown: true,
        }}
      />
      <VStack className="flex-1 px-6"></VStack>
    </SafeAreaView>
  );
};

export default FriendScreen;
