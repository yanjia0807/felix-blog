import React from 'react';
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from './ui/alert-dialog';
import { Text } from './ui/text';
import { Button, ButtonText } from './ui/button';

import { Heading } from './ui/heading';
const PrivacyPolicyDialog = ({ isOpen, onClose }: any) => {
  return (
    <AlertDialog isOpen={isOpen} onClose={onClose} size="md">
      <AlertDialogBackdrop />
      <AlertDialogContent>
        <AlertDialogHeader>
          <Heading className="font-semibold text-typography-950" size="md">
            隐私政策
          </Heading>
        </AlertDialogHeader>
        <AlertDialogBody className="mb-4 mt-3">
          <Text size="sm">
            感谢您使用我们的博客应用！我们致力于保护您的个人信息和隐私安全。以下是我们的隐私政策条款：
          </Text>
          <Text size="sm">
            信息收集：我们会收集您在注册和使用过程中提供的必要信息，如邮箱、昵称等，用于账号管理和服务提供。
          </Text>
          <Text size="sm">
            信息使用：您的信息仅用于改进服务质量，不会在未获您授权的情况下对外披露。
          </Text>
          <Text size="sm">
            信息保护：我们采用多种技术手段保障您的数据安全，防止信息泄露、滥用或丢失。
          </Text>
          <Text size="sm">
            第三方服务：某些功能可能涉及第三方服务，但我们仅与符合隐私标准的合作方合作。
          </Text>
          <Text size="sm">
            用户权利：您有权随时查看、更正或删除个人信息。如需帮助，请通过客服联系我们。
          </Text>
          <Text size="sm">
            政策变更：如隐私政策有更新，我们将通过应用内通知或邮件告知您，请及时关注。
          </Text>
          <Text size="sm">
            使用本应用即表示您同意我们的隐私政策。如有疑问，请随时联系我们的支持团队。
          </Text>
        </AlertDialogBody>
        <AlertDialogFooter className="">
          <Button variant="outline" action="secondary" onPress={onClose} size="sm">
            <ButtonText>同意</ButtonText>
          </Button>
          <Button size="sm" onPress={onClose}>
            <ButtonText>取消</ButtonText>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PrivacyPolicyDialog;
