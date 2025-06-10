import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { router, Stack } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView } from 'react-native';

const AboutPage = () => {
  const renderHeaderLeft = () => (
    <Button
      action="secondary"
      variant="link"
      onPress={() => {
        router.back();
      }}>
      <ButtonText>返回</ButtonText>
    </Button>
  );

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{
          title: '关于',
          headerShown: true,
          headerLeft: renderHeaderLeft,
        }}
      />
      <ScrollView className="flex-1" contentContainerClassName="p-4">
        <VStack className="flex-1" space="xl"></VStack>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutPage;
