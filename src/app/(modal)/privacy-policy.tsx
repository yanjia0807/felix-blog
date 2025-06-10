import { PrivacyPolicyText } from '@/components/app-info';
import { Button, ButtonText } from '@/components/ui/button';
import { router, Stack } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView } from 'react-native';

const PrivacyPolicyPage = () => {
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
          title: '隐私政策',
          headerShown: true,
          headerLeft: renderHeaderLeft,
        }}
      />
      <ScrollView className="flex-1" contentContainerClassName="p-4">
        <PrivacyPolicyText />
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicyPage;
