import React from "react";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { ArrowRight, MailQuestion } from "lucide-react-native";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { useRouter } from "expo-router";

const SendConfirmationEmail = () => {
  const router = useRouter();

  const handleSendMail = () => {
    console.log("sendMail");
  };

  return (
    <VStack className="flex-1 items-center mt-48" space="lg">
      <MailQuestion size={96} className="text-warning-500" />
      <Text className="text-warning-400" size="sm">
        您的邮箱地址还未验证
      </Text>
      <Button
        variant="solid"
        size="md"
        action="default"
        onPress={handleSendMail}
      >
        <ButtonText>发送验证邮件</ButtonText>
        <ButtonIcon as={ArrowRight} />
      </Button>
    </VStack>
  );
};

export default SendConfirmationEmail;
