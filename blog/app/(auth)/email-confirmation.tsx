import React from 'react';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { ArrowRight, CircleCheck } from 'lucide-react-native';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { useRouter } from 'expo-router';

const EmailConfirmation = () => {
  const router = useRouter();

  return (
    <VStack className="mt-48 flex-1 items-center" space="lg">
      <CircleCheck size={96} className="text-success-500" />
      <Text className="text-success-400" size="sm">
        邮件验证成功
      </Text>
      <Button
        variant="solid"
        size="md"
        action="default"
        onPress={() => {
          router.push('/');
        }}>
        <ButtonText>返回主页</ButtonText>
        <ButtonIcon as={ArrowRight} />
      </Button>
    </VStack>
  );
};

export default EmailConfirmation;
