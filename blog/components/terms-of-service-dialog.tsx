import React from 'react';
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from './ui/alert-dialog';
import { Button, ButtonText } from './ui/button';
import { Heading } from './ui/heading';
import { Text } from './ui/text';

const TermsOfServiceDialog = ({ isOpen, onClose }: any) => {
  return (
    <AlertDialog isOpen={isOpen} onClose={onClose} size="md">
      <AlertDialogBackdrop />
      <AlertDialogContent>
        <AlertDialogHeader>
          <Heading className="font-semibold text-typography-950" size="md">
            服务条款
          </Heading>
        </AlertDialogHeader>
        <AlertDialogBody className="mb-4 mt-3">
          <Text size="sm">欢迎使用我们的博客应用！在使用本应用前，请仔细阅读以下服务条款：</Text>
          <Text size="sm">
            账户安全：请妥善保管您的账户信息，任何因账户泄露导致的问题由用户自行负责。
          </Text>
          <Text size="sm">
            内容规范：请勿发布任何违法、侵权、或违反公序良俗的内容，违反者将被删除内容或封禁账号。
          </Text>
          <Text size="sm">
            知识产权：您对自己发布的内容拥有版权，但同时授权我们在平台内展示、推广您的内容。
          </Text>
          <Text size="sm">
            服务变更：我们保留对服务内容、规则进行修改的权利，并会提前通知用户。
          </Text>
          <Text size="sm">
            责任限制：我们尽力保证服务的稳定性，但不对因不可抗力或技术问题造成的损失负责。
          </Text>
          <Text size="sm">
            继续使用本应用，即表示您同意并接受上述条款。如有疑问，请联系我们的支持团队。
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

export default TermsOfServiceDialog;
