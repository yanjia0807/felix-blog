import { PrivacyPolicyText, TermsOfServiceText } from '@/components/app-info';
import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { VStack } from '@/components/ui/vstack';
import { router, Stack } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView } from 'react-native';

const ServiceAndPolicyPage = () => {
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
          title: '服务条款 & 隐私政策',
          headerShown: true,
          headerLeft: renderHeaderLeft,
        }}
      />
      <ScrollView className="flex-1" contentContainerClassName="p-4">
        <VStack className="flex-1" space="xl">
          <TermsOfServiceText />
          <Divider />
          <PrivacyPolicyText />
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ServiceAndPolicyPage;
