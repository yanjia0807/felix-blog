import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Search } from 'lucide-react-native';
import React, { memo } from 'react';

export const UserFilterInput: React.FC<any> = memo(function UserFilterInput({
  onChange,
  value,
  onSubmitEditing,
  isLoading,
}) {
  return (
    <Input variant="rounded" className="w-full">
      <InputSlot className="ml-3">
        <InputIcon as={Search} />
      </InputSlot>
      <InputField
        placeholder="用户名/邮箱地址"
        inputMode="text"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        onChangeText={(text: any) => onChange(text)}
        onSubmitEditing={onSubmitEditing}
        value={value}
      />
      {isLoading && (
        <InputSlot className="mx-3">
          <InputIcon as={Spinner} />
        </InputSlot>
      )}
    </Input>
  );
});
