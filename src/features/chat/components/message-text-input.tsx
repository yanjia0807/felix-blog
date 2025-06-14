import { FormControl } from '@/components/ui/form-control';
import { Input, InputField } from '@/components/ui/input';
import React, { memo } from 'react';

export const MessageTextInput: React.FC<any> = memo(function MessageInput({
  onBlur,
  onChange,
  value,
  onSubmit,
}) {
  return (
    <FormControl size="lg" className="flex-1">
      <Input variant="rounded">
        <InputField
          size="lg"
          autoFocus={true}
          autoCorrect={false}
          autoCapitalize="none"
          inputMode="text"
          returnKeyType="send"
          placeholder="发送消息..."
          onBlur={onBlur}
          onChangeText={onChange}
          value={value}
          onSubmitEditing={onSubmit}
        />
      </Input>
    </FormControl>
  );
});
