import React from 'react';
import { router, Stack } from 'expo-router';
import { SafeAreaView, ScrollView } from 'react-native';
import { TermsOfServiceText } from '@/components/app-info';
import { Button, ButtonText } from '@/components/ui/button';
import { ErrorBoundaryAlert } from '@/components/error';

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

export const ErrorBoundary = ({ error, retry }: any) => (
  <ErrorBoundaryAlert error={error} retry={retry} />
);

export default TermsOfServicePage;
