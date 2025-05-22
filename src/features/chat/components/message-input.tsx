import { memo } from 'react';
import { FormControl } from '@/components/ui/form-control';
import { Input, InputField } from '@/components/ui/input';

export const MessageInput: React.FC<any> = memo(
  ({ onBlur, onChangeText, value, onSubmitEditing, isInvalid }) => {
    return (
      <FormControl size="lg" className="flex-1" isInvalid={isInvalid}>
        <Input className="bg-background-200" variant="rounded">
          <InputField
            placeholder=""
            inputMode="text"
            autoCapitalize="none"
            returnKeyType="send"
            onBlur={onBlur}
            onChangeText={onChangeText}
            value={value}
            onSubmitEditing={onSubmitEditing}
          />
        </Input>
      </FormControl>
    );
  },
);
