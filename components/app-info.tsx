import React from 'react';
import { Heading } from './ui/heading';
import { Text } from './ui/text';
import { VStack } from './ui/vstack';

export const TermsOfServiceText = () => {
  return (
    <VStack space="lg">
      <Heading size="md" className="leading-8">
        欢迎使用我们的博客应用！在使用本应用前，请仔细阅读以下服务条款：
      </Heading>
      <Text size="md" className="leading-8">
        <Text className="font-bold leading-8">账户安全：</Text>
        请妥善保管您的账户信息，任何因账户泄露导致的问题由用户自行负责。{'\n'}
        <Text className="font-bold leading-8">内容规范：</Text>
        请勿发布任何违法、侵权、或违反公序良俗的内容，违反者将被删除内容或封禁账号。
        {'\n'}
        <Text className="font-bold leading-8">知识产权：</Text>
        您对自己发布的内容拥有版权，但同时授权我们在平台内展示、推广您的内容。{'\n'}
        <Text className="font-bold leading-8">服务变更：</Text>
        我们保留对服务内容、规则进行修改的权利，并会提前通知用户。{'\n'}
        <Text className="font-bold leading-8">责任限制：</Text>
        我们尽力保证服务的稳定性，但不对因不可抗力或技术问题造成的损失负责。{'\n'}
        <Text className="font-bold leading-8">继续使用本应用，即表示您同意并接受上述条款。</Text>
        如有疑问，请联系我们的支持团队。
      </Text>
    </VStack>
  );
};

export const PrivacyPolicyText = () => {
  return (
    <VStack space="lg">
      <Heading size="md" className="leading-8">
        感谢您使用我们的博客应用！我们致力于保护您的个人信息和隐私安全。以下是我们的隐私政策条款：
      </Heading>
      <Text size="md" className="leading-8">
        <Text className="font-bold leading-8">信息收集：</Text>
        我们会收集您在注册和使用过程中提供的必要信息，如邮箱、昵称等，用于账号管理和服务提供。
        {'\n'}
        <Text className="font-bold leading-8">信息使用：</Text>
        您的信息仅用于改进服务质量，不会在未获您授权的情况下对外披露。{'\n'}
        <Text className="font-bold leading-8">信息保护：</Text>
        我们采用多种技术手段保障您的数据安全，防止信息泄露、滥用或丢失。{'\n'}
        <Text className="font-bold leading-8">第三方服务：</Text>
        某些功能可能涉及第三方服务，但我们仅与符合隐私标准的合作方合作。{'\n'}
        <Text className="font-bold leading-8">用户权利：</Text>
        您有权随时查看、更正或删除个人信息。如需帮助，请通过客服联系我们。{'\n'}
        <Text className="font-bold leading-8">政策变更：</Text>
        如隐私政策有更新，我们将通过应用内通知或邮件告知您，请及时关注。{'\n'}
        <Text className="font-bold leading-8">使用本应用即表示您同意我们的隐私政策。</Text>
        如有疑问，请随时联系我们的支持团队。
      </Text>
    </VStack>
  );
};
