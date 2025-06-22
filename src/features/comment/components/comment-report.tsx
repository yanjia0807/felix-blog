import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/features/auth/components/auth-provider';
import { useCreateReport } from '@/features/report/api/use-create-report';
import { useFetchReportLegals } from '@/features/report/api/use-fetch-report-legals';
import useToast from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import _ from 'lodash';
import { AlertCircle } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';
import { useSelectComment } from '../store';

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
});

const CommentReport: React.FC<any> = ({ close }) => {
  const [selectedItem, setSelectedItem] = useState<any>();
  const selectComment = useSelectComment();
  const { user } = useAuth();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const mutation = useCreateReport();

  const defaultValues = {
    reporter: user.documentId,
    contentRelation: 'comment',
    contentDocumentId: selectComment.documentId,
    legalDocumentId: undefined,
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

  const reportLegalsQuery = useFetchReportLegals();
  const reportLegals = _.flatMap(reportLegalsQuery.data?.pages, (page) => page.data);

  const onSubmit = () => {
    handleSubmit(async (formData: ReportSchema) => {
      return mutation.mutate(formData, {
        onSuccess: (data, variables) => {
          toast.success({
            description: '提交成功',
          });
          close();
        },
        onError(error, variables, context) {
          toast.error({ description: error.message });
        },
      });
    })();
  };

  const renderReportLegals = useCallback(
    ({ field: { onChange, onBlur, value } }: any) => (
      <FormControl size="sm" isInvalid={!!errors?.legalDocumentId?.message}>
        <HStack className="w-full flex-wrap items-center justify-start" space="md">
          {_.map(reportLegals, (item) => (
            <Button
              key={item.documentId}
              variant={selectedItem?.documentId === item.documentId ? 'solid' : 'outline'}
              onPress={() => {
                setSelectedItem(item);
                onChange(item.documentId);
              }}
              action="secondary">
              <ButtonText>{item.word}</ButtonText>
            </Button>
          ))}
        </HStack>
        <FormControlError>
          <FormControlErrorIcon as={AlertCircle} />
          <FormControlErrorText>{errors?.legalDocumentId?.message}</FormControlErrorText>
        </FormControlError>
      </FormControl>
    ),
    [errors?.legalDocumentId?.message, reportLegals, selectedItem?.documentId],
  );

  return (
    <View className="flex-1">
      <VStack className="flex-1 bg-background-100 p-4" space="md">
        <Heading className="self-center">评论举报</Heading>
        <Divider />
        <Text sub={true}>举报原因</Text>
        <HStack className="w-full flex-wrap items-center justify-center" space="md">
          <Controller control={control} name="legalDocumentId" render={renderReportLegals} />
        </HStack>
      </VStack>
      <HStack
        className="absolute bottom-0 items-center p-4"
        style={{ paddingBottom: insets.bottom }}>
        <Button className="flex-1" onPress={onSubmit}>
          <ButtonText>提交</ButtonText>
        </Button>
      </HStack>
    </View>
  );
};

export default CommentReport;
