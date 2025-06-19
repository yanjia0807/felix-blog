import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
} from '@/components/ui/form-control';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { AlertCircle } from 'lucide-react-native';
import React, { memo, useState } from 'react';

export const ReportRemarkInput: React.FC<any> = memo(function ReportContentInput({
  error,
  value,
  onChange,
  onBlur,
  contentRelation,
  maxChars,
}) {
  const [charCount, setCharCount] = useState(0);

  const onChangeText = (props: any) => {
    setCharCount(props?.length);
    onChange(props);
  };

  let placeholder = '请填写举报原因，以提高举报成功率';
  if (contentRelation === 'post') {
    placeholder = '请描述作品中存在的问题，如：涉及哪些事件或人物';
  } else if (contentRelation === 'user') {
    placeholder = '请描述该用户存在的问题，如：涉及相关帖子，评论，或聊天';
  }

  return (
    <FormControl size="md" isInvalid={!!error}>
      <Textarea className="h-48 border-l-0 border-r-0 border-t-0" size="md" variant="default">
        <TextareaInput
          placeholder={placeholder}
          inputMode="text"
          autoCapitalize="none"
          onBlur={onBlur}
          onChangeText={onChangeText}
          value={value}
        />
      </Textarea>
      <FormControlHelper className="justify-end">
        <FormControlHelperText>{`${charCount}/${maxChars}`}</FormControlHelperText>
      </FormControlHelper>
      <FormControlError>
        <FormControlErrorIcon as={AlertCircle} />
        <FormControlErrorText>{error?.message}</FormControlErrorText>
      </FormControlError>
    </FormControl>
  );
});
