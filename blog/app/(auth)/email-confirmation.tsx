import React from 'react';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { ArrowRight } from 'lucide-react-native';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/components/auth-context';

const EmailConfirmation = () => {
  const router = useRouter();
  const { user } = useAuth();
  return (
    <>
      <Stack.Screen
        options={{
          title: '验证成功',
        }}
      />
      <VStack className="flex-1 items-center justify-center p-4" space="lg">
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
    </>
  );
};

export default EmailConfirmation;
