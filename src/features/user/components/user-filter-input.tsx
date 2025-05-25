import React, { memo } from 'react';
import { Search } from 'lucide-react-native';
import { Input, InputSlot, InputIcon, InputField } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

export const UserFilterInput: React.FC<any> = memo(
  ({ onChange, value, onSubmitEditing, isLoading }) => {
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
          onChangeText={onChange}
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
  },
);
