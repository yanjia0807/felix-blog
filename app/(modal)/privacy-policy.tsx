import React from 'react';
import { router, Stack } from 'expo-router';
import { SafeAreaView, ScrollView, View } from 'react-native';
import { PrivacyPolicyText } from '@/components/app-info';
import { Button, ButtonText } from '@/components/ui/button';
import { PageFallbackUI } from '@/components/fallback';

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

export const ErrorBoundary = ({ error, retry }: any) => (
  <PageFallbackUI error={error} retry={retry} />
);

export default PrivacyPolicyPage;
