import { TermsOfServiceText } from '@/components/app-info';
import { Button, ButtonText } from '@/components/ui/button';
import { router, Stack } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView } from 'react-native';

const TermsOfServicePage = () => {
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
          title: '服务条款',
          headerShown: true,
          headerLeft: renderHeaderLeft,
        }}
      />
      <ScrollView className="flex-1" contentContainerClassName="p-4">
        <TermsOfServiceText />
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsOfServicePage;
