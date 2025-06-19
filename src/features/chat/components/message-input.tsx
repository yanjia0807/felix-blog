import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { useCreateMessage } from '@/features/chat/api/use-create-message';
import { MessageTextInput } from '@/features/chat/components/message-text-input';
import { MessageVoiceInput } from '@/features/chat/components/message-voice-input';
import useToast from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { AudioLines, Keyboard } from 'lucide-react-native';
import React, { memo, useCallback, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { TouchableOpacity } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { z } from 'zod';
import { MessageImageryInput } from './message-imagery-input';

type MessageFormSchema = z.infer<typeof messageFormSchema>;

const messageFormSchema = z
  .object({
    messageType: z.enum(['text', 'voice', 'imagery']),
    content: z.string().optional(),
    voice: z
      .strictObject({
        file: z.string(),
        secs: z.number(),
      })
      .optional(),
    imageries: z.array(z.any()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.messageType === 'text') {
      if (!data.content || data.content.trim().length === 0 || data.content.trim().length > 5000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '文本内容不能为空或多于5000个字符',
          path: ['content'],
        });
      }
    } else if (data.messageType === 'voice') {
      if (!data.voice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '语音内容不能为空',
          path: ['voice'],
        });
      }
    } else if (data.messageType === 'imagery') {
      if (!data.imageries || data.imageries.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '图片内容不能为空',
          path: ['images'],
        });
      }
    }
  });

export const MessageInput: React.FC<any> = memo(function MessageInput({
  chatDocumentId,
  sender,
  receiver,
  isBlock,
  successCb,
}) {
  const toast = useToast();
  const onToast = useRef((type, message): any => {
    toast[type](message);
  });

  const {
    control,
    formState: { errors },
    handleSubmit,
    watch,
    setValue,
  } = useForm<MessageFormSchema>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      messageType: 'text',
      content: undefined,
      voice: undefined,
      imageries: undefined,
    },
  });

  const formData: any = watch();

  const { mutate: createMessage } = useCreateMessage({ documentId: chatDocumentId });

  const onChangeMessageType = (type) => {
    setValue('messageType', type);
  };

  const onSubmit = useCallback(
    ({ messageType, content, voice, imageries }: MessageFormSchema) => {
      if (isBlock) {
        toast.error({
          title: '发送失败',
          description: '该用户已被屏蔽',
        });
        return;
      }

      const data = {
        chat: chatDocumentId,
        sender,
        receiver,
        messageType,
        voice,
        content,
        imageries,
      };

      createMessage(data, {
        onSuccess() {
          successCb();
          setValue('content', undefined);
          setValue('voice', undefined);
          setValue('imageries', undefined);
          if (messageType === 'imagery') setValue('messageType', 'text');
        },
        onError(error) {
          onToast.current('error', { description: error.message });
        },
      });
    },
    [isBlock, chatDocumentId, sender, receiver, createMessage, toast, successCb, setValue],
  );

  const renderVoiceInput = useCallback(
    ({ field: { onChange, value } }: any) => (
      <MessageVoiceInput onChange={onChange} value={value} onSubmit={handleSubmit(onSubmit)} />
    ),
    [handleSubmit, onSubmit],
  );

  const renderTextInput = useCallback(
    ({ field: { onChange, onBlur, value } }: any) => (
      <MessageTextInput
        onBlur={onBlur}
        onChange={onChange}
        value={value}
        onSubmit={handleSubmit(onSubmit)}
      />
    ),
    [handleSubmit, onSubmit],
  );

  const renderImageryInput = useCallback(
    ({ field: { onChange, onBlur, value } }: any) => (
      <MessageImageryInput
        onBlur={onBlur}
        onChange={(val) => {
          setValue('messageType', 'imagery');
          onChange(val);
        }}
        value={value}
        onSubmit={handleSubmit(onSubmit)}
      />
    ),
    [handleSubmit, onSubmit, setValue],
  );

  return (
    <>
      <KeyboardAvoidingView behavior={'padding'} keyboardVerticalOffset={100}>
        {formData.messageType === 'text' && (
          <HStack space="md" className="items-center">
            <TouchableOpacity onPress={() => onChangeMessageType('voice')}>
              <Icon size="xl" as={AudioLines} />
            </TouchableOpacity>
            <Controller name="content" control={control} render={renderTextInput} />
            <Controller name="imageries" control={control} render={renderImageryInput} />
          </HStack>
        )}

        {formData.messageType === 'voice' && (
          <HStack space="md" className="items-center">
            <TouchableOpacity onPress={() => onChangeMessageType('text')}>
              <Icon size="xl" as={Keyboard} />
            </TouchableOpacity>
            <Controller name="voice" control={control} render={renderVoiceInput} />
            <Controller name="imageries" control={control} render={renderImageryInput} />
          </HStack>
        )}
      </KeyboardAvoidingView>
    </>
  );
});
