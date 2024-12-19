import { Redirect, router, Stack } from 'expo-router';
import React from 'react';
import { Text, ScrollView } from 'react-native';
import { useAuth } from '@/components/auth-context';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { SafeAreaView } from '@/components/ui/safe-area-view';

const Message = () => {
  const { user }: any = useAuth();
  if (!user) {
    return <Redirect href="/anonymous" />;
  }

  const renderHeaderRight = () => {
    return (
      <HStack space="md" className="items-center">
        <Button
          action="primary"
          size="md"
          variant="link"
          onPress={() => router.push('/add-friend')}>
          <ButtonText>添加朋友</ButtonText>
        </Button>
      </HStack>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: '圈子',
          headerShown: true,
          headerRight: renderHeaderRight,
        }}
      />
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}></ScrollView>
      </SafeAreaView>
    </>
  );
};

export default Message;
