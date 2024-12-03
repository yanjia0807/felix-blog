import { Stack } from 'expo-router';
import { ArrowRight, MailQuestion } from 'lucide-react-native';
import React from 'react';
import { SafeAreaView } from 'react-native';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

const SendConfirmationEmail = () => {
  const handleSendMail = () => {};

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{
          title: '发送验证邮件',
        }}
      />
      <VStack className="mt-48 flex-1 items-center" space="lg">
        <VStack className="flex-1">
          <MailQuestion size={96} className="text-warning-500" />
          <Text className="text-warning-400" size="sm">
            您的邮箱地址还未验证
          </Text>
          <Button variant="solid" size="md" action="default" onPress={handleSendMail}>
            <ButtonText>发送验证邮件</ButtonText>
            <ButtonIcon as={ArrowRight} />
          </Button>
        </VStack>
      </VStack>
    </SafeAreaView>
  );
};

export default SendConfirmationEmail;
