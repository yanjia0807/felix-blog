import { FormControl } from '@/components/ui/form-control';
import { Input, InputField } from '@/components/ui/input';
import React, { memo } from 'react';

export const MessageInput: React.FC<any> = memo(function MessageInput({
  onBlur,
  onChangeText,
  value,
  onSubmitEditing,
  isInvalid,
}) {
  return (
    <FormControl size="lg" className="flex-1" isInvalid={isInvalid}>
      <Input variant="rounded">
        <InputField
          autoFocus={true}
          autoCorrect={false}
          autoCapitalize="none"
          inputMode="text"
          returnKeyType="send"
          placeholder="发送消息..."
          onBlur={onBlur}
          onChangeText={onChangeText}
          value={value}
          onSubmitEditing={onSubmitEditing}
        />
      </Input>
    </FormControl>
  );
});
