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

export const MAX_CHARS = 5000;

export const PostContentInput: React.FC<any> = memo(function PostContentInput({
  error,
  value,
  onChange,
  onBlur,
}) {
  const [charCount, setCharCount] = useState(0);

  const onChangeText = (props: any) => {
    setCharCount(props?.length);
    onChange(props);
  };

  return (
    <FormControl size="md" isInvalid={!!error}>
      <Textarea className="h-48 border-l-0 border-r-0 border-t-0" size="md" variant="default">
        <TextareaInput
          placeholder="你此时的感想..."
          inputMode="text"
          autoCapitalize="none"
          onBlur={onBlur}
          onChangeText={onChangeText}
          value={value}
        />
      </Textarea>
      <FormControlHelper className="justify-end">
        <FormControlHelperText>{`${charCount}/${MAX_CHARS}`}</FormControlHelperText>
      </FormControlHelper>
      <FormControlError>
        <FormControlErrorIcon as={AlertCircle} />
        <FormControlErrorText>{error?.message}</FormControlErrorText>
      </FormControlError>
    </FormControl>
  );
});
