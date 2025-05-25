import React, { memo } from 'react';
import _ from 'lodash';
import { AlertCircle } from 'lucide-react-native';
import { Controller } from 'react-hook-form';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from '@/components/ui/form-control';
import { Input, InputField, InputSlot } from '@/components/ui/input';
import { TagInput } from '@/features/tag/components/tag-input';

export const PostTitleInput: React.FC<any> = memo(({ error, value, onChange, control }) => {
  const renderTagInput = ({ field: { onChange, onBlur, value } }: any) => (
    <TagInput value={value} onChange={onChange} />
  );

  return (
    <FormControl isInvalid={!!error} size="md">
      <Input variant="underlined" className="border-0 border-b p-2">
        <InputField
          placeholder="请输入标题...."
          inputMode="text"
          autoCapitalize="none"
          onChangeText={onChange}
          value={value}
        />
        <InputSlot>
          <Controller control={control} name="tags" render={renderTagInput} />
        </InputSlot>
      </Input>
      <FormControlError>
        <FormControlErrorIcon as={AlertCircle} />
        <FormControlErrorText>{error?.message}</FormControlErrorText>
      </FormControlError>
    </FormControl>
  );
});
