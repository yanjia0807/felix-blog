import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/features/auth/components/auth-provider';
import { useCreateReport } from '@/features/report/api/use-create-report';
import { useReportLegal } from '@/features/report/api/use-fetch-report-legal';
import { ReportRemarkInput } from '@/features/report/components/report-remark-input';
import useToast from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { SafeAreaView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

const MAX_CHARS = 200;

export type ReportSchema = z.infer<typeof reportSchema>;

export const reportSchema = z.object({
  reporter: z.string({
    required_error: '举报人是必填项',
  }),
  contentRelation: z.string({
    required_error: '举报类型是必填项',
  }),
  contentDocumentId: z.string({
    required_error: '举报内容是必填项',
  }),
  legalDocumentId: z.string({
    required_error: '违规类型是必填项',
  }),
  remark: z.string().max(MAX_CHARS, `内容最多不能超过${MAX_CHARS}个字符`).optional(),
});

const ReportSubmitPage: React.FC<any> = () => {
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { contentRelation, contentDocumentId, legalDocumentId }: any = useLocalSearchParams();

  const mutation = useCreateReport();

  const defaultValues = {
    reporter: user.documentId,
    contentRelation,
    contentDocumentId,
    legalDocumentId,
    remark: '',
  };

  const form = useForm<ReportSchema>({
    resolver: zodResolver(reportSchema),
    defaultValues,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  const { data } = useReportLegal({ documentId: legalDocumentId });

  const onSubmit = () => {
    handleSubmit(async (formData: ReportSchema) => {
      return mutation.mutate(formData, {
        onSuccess: (data, variables) => {
          toast.success({
            description: '提交成功',
          });
          router.dismissAll();
        },
        onError(error, variables, context) {
          toast.error({ description: error.message });
        },
      });
    })();
  };

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

  const renderRemark = useCallback(
    ({ field: { onChange, onBlur, value } }: any) => (
      <ReportRemarkInput
        onChange={onChange}
        value={value}
        error={errors?.remark}
        contentRelation={contentRelation}
        maxChars={MAX_CHARS}
      />
    ),
    [contentRelation, errors?.remark],
  );

  let title = '举报';
  if (contentRelation === 'post') {
    title = '举报帖子';
  } else if (contentRelation === 'user') {
    title = '举报用户';
  }

  return (
    <>
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <Stack.Screen
          options={{
            title,
            headerShown: true,
            headerLeft: renderHeaderLeft,
          }}
        />

        <SafeAreaView className="flex-1">
          <VStack className="flex-1 px-4" space="lg">
            <Card variant="ghost">
              <VStack space="md">
                <Text className="font-bold">{data?.word}</Text>
                <Text sub={true}>{data?.description}</Text>
              </VStack>
            </Card>

            <Card>
              <VStack space="md">
                <Text className="font-bold">举报描述</Text>
                <Controller control={control} name="remark" render={renderRemark} />
              </VStack>
            </Card>
          </VStack>
        </SafeAreaView>
      </KeyboardAwareScrollView>
      <HStack
        className="absolute bottom-0 items-center p-4"
        style={{ paddingBottom: insets.bottom }}>
        <Button className="flex-1" onPress={onSubmit}>
          <ButtonText>提交</ButtonText>
        </Button>
      </HStack>
    </>
  );
};

export default ReportSubmitPage;
