import { Stack, useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import React from 'react';
import { SafeAreaView } from 'react-native';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

const EmailConfirmation = () => {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{
          title: '验证成功',
        }}
      />
      <VStack className="flex-1 items-center justify-center p-6">
        <VStack className="flex-1" space="lg">
          <Text>{`恭喜您，您的邮箱已经成功验证！`}</Text>
          <Text>如需帮助，请访问 帮助中心。</Text>
          <Button
            variant="solid"
            size="md"
            action="primary"
            onPress={() => {
              router.push('/login');
            }}>
            <ButtonText>返回登录页面</ButtonText>
            <ButtonIcon as={ArrowRight} />
          </Button>
        </VStack>
      </VStack>
    </SafeAreaView>
  );
};

export default EmailConfirmation;
